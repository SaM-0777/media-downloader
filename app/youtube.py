from pytube import YouTube, Playlist
from pytube import exceptions as E


class YoutubeStream():
    def __init__(self, url):
        self.url = url
        
    def get_response(self):
        try:
            yt = YouTube(self.url)
        except E.RegexMatchError as e:
            return {"error": "Error Check url"}
        except E.HTMLParseError as e:
            return {"error": "Oops something went wrong!"}
        except E.ExtractError as e:
            return {"error": "Oops something went wrong!"}
        except E.VideoUnavailable as e:
            return {"error": "Video unavailale"}
        except E.VideoPrivate as e:
            return {"error": "Video is private"}
        except E.VideoRegionBlocked as e:
            return {"error": "Video is blocked in your region"}
        except E.AgeRestrictedError as e:
            return {"error": "Video is age Rstricted"}
        except E.LiveStreamError as e:
            return {"error": "Live stream can not be downloded"}
        except E.MaxRetriesExceeded as e:
            return {"error": "Oops something went wrong!"}
        except E.MembersOnly as e:
            return {"error": "Oops something went wrong!"}
        except E.RecordingUnavailable as e:
            return {"error": "Recording unavialable"}
        else:
            return self.response_wrapper(yt)

    def response_wrapper(self, yt):
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
            

