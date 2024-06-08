from rest_framework import serializers
from .models import Result


class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        ordering = ["-score"]
        fields = "__all__"