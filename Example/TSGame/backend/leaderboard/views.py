from django.shortcuts import render

from rest_framework import generics, permissions
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from .models import Result
from .serializers import LeaderboardSerializer


class Login(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user.id})


class CreateHiScore(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = LeaderboardSerializer

    def get_queryset(self):
        return Result.objects.all()


class ReUpHiScore(generics.RetrieveUpdateAPIView):
    # permission_classes = [permissions.IsAuthenticated]
    queryset = Result.objects.all()
    serializer_class = LeaderboardSerializer


class GetHigh(generics.ListAPIView):
    serializer_class = LeaderboardSerializer

    def get_queryset(self):
        return Result.objects.all()

    # def get(self):
    #     res = []
    #     scores = Result.objects.order_by('-score')[:11]
    #     for s in scores:
    #         lead_dict = {
    #             'user': s.user,
    #             'score': s.score
    #         }
    #         res.append(lead_dict)
    #     return Response({'score': res})
