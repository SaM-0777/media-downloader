from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, JsonResponse

from .youtube import YoutubeStream


# Create your views here.

def index(request):
    return render(request, 'app/base.html', context= {})


def yt_response(request):
    if request.method == 'POST':
        url = request.POST.get('value')
        youtube_response = YoutubeStream(url).get_response()
        return JsonResponse(youtube_response, safe= False)
    else:
        return HttpResponseNotFound()

