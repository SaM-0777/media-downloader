from django.urls import path
from . import views

app_name = 'app'
urlpatterns = [
    path('', views.index, name= "home"),
    path('ytresponse', views.yt_response, name= "youtube-response")
]

