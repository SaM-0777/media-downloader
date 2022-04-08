const scrollButton = document.querySelector("#scroll-to-search-aria")
scrollButton.onclick = () => {
    document.querySelector("#search-section").scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
}

// search-box
const searchInput = document.querySelector("#search-box").querySelector(".search-input")
const searchButton = document.querySelector("#search-box").querySelector("#search-button")

// response-section
const responseSection = document.querySelector("#response-section")
const successResponse = responseSection.querySelector("#success")
const downloadChoice = successResponse.querySelector("#download-choice")
const errorResponse = document.querySelector("#search-section").querySelector("#error")
const successIframe = successResponse.querySelector("#youtube-embed")
const videoTitle = successResponse.querySelector("#video-title")

const sizeUnit = ["KB", "MB", "GB", "TB"]
var searchInputValueState = 0

// trigger state when input value is modified
searchInput.addEventListener("change", () => {
    searchInputValueState = 1
})

// toggle error section
function toggleErrorSection(state) {
    if (state) errorResponse.style.display = ""
    else errorResponse.style.display = "none"
}
// toggle - off error-section
toggleErrorSection(0)   // off

// toggle response-section
function toggleResponseSection(state) {
    if (state) responseSection.style.display = ""
    else responseSection.style.display = "none"
}

// toggle-off response-section
toggleResponseSection(0)     // off

// loading-animation (display : none)
let animationSpan = document.createElement("span")
animationSpan.classList.add(...["spinner-border", "spinner-border-sm", "ms-2"])
animationSpan.setAttribute("role", "status")
animationSpan.ariaHidden = true

// toggle loading animation
function toggleLoadingAnimation(state) {
    if (state) animationSpan.style.display = "inline-block"
    else animationSpan.style.display = "none"
}

// toggle-off loading-animation 
toggleLoadingAnimation(0)    // off


// main
searchButton.onclick = function () {
    // validate search-field
    if (searchInput.value != "" && searchInput.value != null && searchInputValueState) {
        // console.log("Validation successful")
        searchInputValueState = 0
        // start loading-animation
        searchButton.textContent = "Loading"
        searchButton.append(animationSpan)
        toggleLoadingAnimation(1)    // on
        searchButton.disabled = true

        // remove children
        downloadChoice.innerHTML = ""

        // callback url
        const callbackUrl = getUrl()
        makeAjaxCall(callbackUrl)
        return
    }
    successResponse.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" })
    return
}


// ajax call
function makeAjaxCall(callback) {

    $.ajaxSetup({
        url: callback,
        global: false,
        type: "POST",
        headers: {
            "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
        },
    })
    $.ajax({
        data: { 'value': searchInput.value },
        dataType: "json",
        timeout: 3000,
        complete: function () {
            // stop animation

        },
        success: function (response) {
            // console.log(response)
            // console.log(response.title)
            if (response.title) {
                toggleErrorSection(0)
                renderSuccessResponse(response)
                toggleResponseSection(1)     // on
            }
            // render error
            else renderErrorResponse(response)

            toggleLoadingAnimation(0)    // off
            // window.location.hash = "#response-section"
            searchButton.disabled = false
            successResponse.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"})
            searchButton.textContent = "Download"
        },
        error: function (response) {
            renderErrorResponse(response)
            toggleLoadingAnimation(0)    // off
            searchButton.disabled = false
            searchButton.textContent = "Download"
        }
    })

}
// ajax-call completed

// clearTimeout(timeOut)

// error - response
function renderErrorResponse(response) {
    // render error
    // console.log(response)
    var errorMsg = response.error || "Oops something went wrong, try again"
    errorResponse.querySelector("h5").textContent = errorMsg
    toggleErrorSection(1)    // on
}

// success - response
function renderSuccessResponse(response) {

    // step-1 (filter response)
    var contentTitle = response.title
    var streams = [...response.streams.formats, ...response.streams.adaptiveFormats]     // list

    if (searchInput.value.includes("shorts")) var videoCode = searchInput.value.split("/")[4].split("?")[0]
    else var videoCode = searchInput.value.split("/")[3]

    // console.log(videoCode)

    // step - 2 (set up iframe and title)
    successIframe.src = "https://www.youtube.com/embed/" + videoCode
    videoTitle.textContent = contentTitle

    // step - 3
    // part - 1 (function to make download-a for each stream in formats and adaptiveFormats, append download-a)
    for (i = 0; i < streams.length; i++) {
        downloadChoice.append(getDownloadButtons(streams[i]))
    }
    // part - 2 ()

}

function getDownloadButtons(stream) {

    // required variables
    var ahref = stream.url
    var contentLength = stream.contentLength
    var mimeType = stream.mimeType.split(";")[0]
    var contentType = mimeType.split("/")[0]   // video or audio
    var formatType = mimeType.split("/")[1]    // content format (MP4, 3GPP, M4A)
    var btnStyle = "btn-info"
    var iconType = "adaptiveVideo"

    // pre step modification
    // formatType, quality modification
    if (contentType == "audio") {
        btnStyle = "btn-danger"
        iconType = "audio"
        var quality = getBitrate(stream.bitrate || "")
        if (formatType == "mp4") formatType = "m4a"
    }
    else if (contentType == "video") {
        var quality = stream.qualityLabel
        if (stream.audioQuality) {
            iconType = "video"
            btnStyle = "btn-success"
        }
    }

    // content length
    if (contentLength) var downloadSize = getDownloadSize(contentLength)
    else var downloadSize = ""

    // create a
    let a = document.createElement("a")
    let qualityDiv = document.createElement("div")
    let formatDiv = document.createElement("div")
    let downloadSizeDiv = document.createElement("div")
    a.append(...[qualityDiv, formatDiv, downloadSizeDiv])

    // set properties
    a.href = ahref
    a.classList.add(...["col-lg-2", "col-md-3", "col-3", "mx-1", "my-1", "btn", btnStyle])
    qualityDiv.append(quality)
    formatDiv.append(...[getIconSpan(iconType), formatType])
    downloadSizeDiv.append(downloadSize)

    a.download = videoTitle.textContent + "." + formatType
    a.target = "_blank"
    // a.onclick = downloadMedia(ahref, mimeType, videoTitle.textContent + "." + formatType)

    // console.log(a.download)

    return a
}

// icon - span
function getIconSpan(iconType) {
    let i = document.createElement("i")
    let span = document.createElement("span")
    i.classList.add(...["fa-solid", "me-1"])
    span.append(i)
    if (iconType == "video") i.classList.add("fa-video")
    else if (iconType == "audio") i.classList.add("fa-music")
    else if (iconType == "adaptiveVideo") i.classList.add("fa-volume-xmark")
    return span
}

// bitrate
function getBitrate(bitrate) {
    while (bitrate > 1024) {
        bitrate = bitrate / 1024
    }
    return bitrate.toString().split(".")[0] + "KBPS"
}

// download size
function getDownloadSize(contentLength) {
    var size = parseInt(contentLength)
    var k = 0
    while (size > 1024) {
        size = size / 1024
        k++
    }
    var downloadSize = size.toFixed(1).toString()
    return "(" + downloadSize + sizeUnit[k - 1] + ")"
}


/*function downloadMedia(element, href, mimeType = "application/octet-stream", fileName) {
    const a = element
    let file = fetch(href).then(r => r.blob()).then(
        blobFile => new File([blobFile], fileName, { type: mimeType })
    )
    const fileLink = URL.createObjectURL(file)
    a.href = fileLink
    a.click()
    URL.revokeObjectURL(href)
}*/
