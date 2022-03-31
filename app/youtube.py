from pytube import YouTube, Playlist
from pytube import exceptions as E


class YoutubeStream():
    def __init__(self, url):
        self.url = url
        
    def get_response(self):
        try:
            yt = YouTube(self.url)
        except E.RegexMatchError as e:
            error = "Make sure url is valid"
            return {"error": error}
        except E.HTMLParseError as e:
            error = "Oops something went wrong, try again with different url"
            return {"error": error}
        except E.ExtractError as e:
            error = "Oops something went wrong, try again with different url"
            return {"error": error}
        except E.VideoUnavailable as e:
            error = "Video Unavailable, try again with different url"
            return {"error": error}
        except E.VideoPrivate as e:
            error = "This video is private and can not be downloded, try again with different video"
            return {"error": error}
        except E.VideoRegionBlocked as e:
            error = "Video is blocked in your region, try again with different video"
            return {"error": error}
        except E.AgeRestrictedError as e:
            error = "Video is Age Restricted and can not be downloaded, try again with different video"
            return {"error": error}
        except E.LiveStreamError as e:
            error = "Live streams can not be downloaded, try again with different video"
            return {"error": error}
        except E.MaxRetriesExceeded as e:
            error = "Oops something went wrong try again"
            return {"error": error}
        except E.MembersOnly as e:
            error = "Permission denied by Youtube, try again with different video"
            return {"error": error}
        except E.RecordingUnavailable as e:
            error = "Recording unavailable, try again with different video"
            return {"error": error}
        else:
            return self.wrap_response(yt)

    def wrap_response(self, yt):
        # return json (title, streams)
        stream_title = yt.title
        streams = yt.streaming_data
        response = {
            "title": stream_title,
            "streams" : streams,
        }
        return response

        
# if __name__ == "__main__":
#     ins = YoutubeStream("https://youtu.be/uD2Ey060DZXg")
#     response = ins.get_response()
#     print(response)
            

