document.addEventListener("DOMContentLoaded", () => {

    const sizeUnit = ["KB", "MB", "GB", "TB"]
    
    // search-box
    const searchInput = document.querySelector("#search-box").querySelector(".search-input")
    const searchButton = document.querySelector("#search-box").querySelector("#search-button")

    // response-section
    const responseSection = document.querySelector("#response-section")
    const successResponse = responseSection.querySelector("#success")
    const successIframe = successResponse.querySelector("#youtube-embed")
    const videoTitle = successResponse.querySelector("#video-title")
    const downloadChoice = successResponse.querySelector("#download-choice")
    const errorResponse = responseSection.querySelector("#error")
    
    // toggle response-section
    function toggleResponseSection() {
        
        if (responseSection.style.display == "none") {
            responseSection.style.display = ""
        }
        else if (responseSection.style.display == "") {
            responseSection.style.display = "none"
        }

    }
    
    // toggle-off response-section
    toggleResponseSection()     // off
    
    // loading-animation (display : none)
    let animationSpan = document.createElement("span")
    animationSpan.classList.add(...["spinner-border", "spinner-border-sm", "ms-2"])
    animationSpan.setAttribute("role", "status")
    animationSpan.ariaHidden = true
    
    // toggle loading animation
    function toggleLoadingAnimation() {

        if (animationSpan.style.display == "none") {
            animationSpan.style.display = "inline-block"
        }
        else if (animationSpan.style.display == "inline-block" || animationSpan.style.display == "") {
            animationSpan.style.display = "none"
        }

    }

    // toggle-off loading-animation 
    toggleLoadingAnimation()    // off





    // main
    searchButton.onclick = function () {

        // validate search-field
        if (searchInput.value != "") {

            // start loading-animation
            searchButton.textContent = "Loading"
            searchButton.append(animationSpan)
            toggleLoadingAnimation()    // on
            searchButton.disabled = true

            // make ajax-call
            // callback url
            const callbackUrl = getUrl()

            setTimeout(makeAjaxCall, 3000)

            // ajax call
            function makeAjaxCall() {
                
                $.ajaxSetup({
                    url: callbackUrl,
                    global: false,
                    type: "POST",
                    headers: {
                        "X-CSRFToken": document.querySelector("[name=csrfmiddlewaretoken]").value,
                    },
                })
                $.ajax({
                    data: { 'value': searchInput.value },
                    dataType: "json",
                    complete: function () {
                        // stop animation

                    },
                    success: function (response) {
                        // console.log(response)
                        renderSuccessResponse(response)
                        toggleResponseSection()     // on
                        toggleLoadingAnimation()    // off
                        searchButton.disabled = false
                        searchButton.textContent = "Download"
                    },
                    error: function (response) {
                        console.log("Error ", response)
                        renderErrorResponse(response)
                        toggleResponseSection()     // on
                        toggleLoadingAnimation()    // off
                        searchButton.disabled = false
                        searchButton.textContent = "Download"
                    }
                })

            }
            // ajax-call completed


            // success - response
            function renderSuccessResponse(response) {

                // step-1 (filter response)
                var contentTitle = response.title
                var streams = [...response.streams.formats, ...response.streams.adaptiveFormats]     // list

                // step - 2 (set up iframe and title)
                successIframe.src = "https://www.youtube.com/embed/" + searchInput.value.split("/")[3]
                videoTitle.textContent = contentTitle

                // step - 3
                // part - 1 (function to make download-a for each stream in formats and adaptiveFormats, append download-a)
                for (i = 0; i < streams.length; i++) {
                    downloadChoice.append(getDownloadButtons(streams[i]))
                }
                // part - 2 ()

            }

            // error - response
            function renderErrorResponse(response) {
                console.log(response)
            }



            function getDownloadButtons(stream) {

                // required variables
                var ahref = stream.url
                var contentLength = stream.contentLength
                var contentType = stream.mimeType.split(";")[0].split("/")[0]   // video or audio
                var formatType = stream.mimeType.split(";")[0].split("/")[1]    // content format (MP4, 3GPP, M4A)
                var btnStyle = "btn-info"
                var iconType = "adaptiveVideo"

                // pre step modification
                // formatType, quality modification
                if (contentType == "audio") {
                    btnStyle = "btn-danger"
                    iconType = "audio"
                    var quality = getBitrate(stream.bitrate)
                    if (formatType == "mp4") {
                        formatType = "m4a"
                    }
                }
                else if (contentType == "video") {
                    var quality = stream.qualityLabel
                    if (stream.audioQuality) {
                        iconType = "video"
                        btnStyle = "btn-success"
                    }
                }

                // content length
                if (contentLength) {
                    var downloadSize = getDownloadSize(contentLength)
                }
                else {
                    var downloadSize = ""
                }

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

                return a
            }

            // icon - span
            function getIconSpan(iconType) {

                let i = document.createElement("i")
                let span = document.createElement("span")
                span.append(i)
                i.classList.add(...["fa-solid", "me-1"])
                if (iconType == "video") {
                    i.classList.add("fa-video")
                }
                else if (iconType == "audio") {
                    i.classList.add("fa-music")
                }
                else if (iconType == "adaptiveVideo") {
                    i.classList.add("fa-volume-xmark")
                }
                return span
            }

            // bitrate
            function getBitrate(bitrate) {
                if (bitrate > 1024) {
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
                    k ++
                }
                var downloadSize = size.toFixed(1).toString()
                return "(" + downloadSize + sizeUnit[k - 1] + ")"
            }


        }

    }


})



