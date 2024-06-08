from django.urls import path

from .views import (
    CreateHiScore,
    Login,
    ReUpHiScore,
    GetHigh
)

urlpatterns = [
    path('create-hi-score/', CreateHiScore.as_view(), name="create-hi-score"),
    path('login/', Login.as_view(), name="login"),
    path('reupde-hi-score/<int:pk>', ReUpHiScore.as_view(), name="reupde"),
    path('gethigh', GetHigh.as_view())
]