from django.db import models
from django.conf import settings

# Create your models here.
class Result(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    score = models.IntegerField()

    class Meta:
        ordering = ["-score"]

    def __str__(self):
        return f"{self.user} - {(self.score)} points"