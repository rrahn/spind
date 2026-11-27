from django import forms


class GuardianSignupForm(forms.Form):
    """Extra fields allauth adds to (headless) signup; stored on the User row."""

    first_name = forms.CharField(max_length=150, strip=True)
    last_name = forms.CharField(max_length=150, strip=True)

    def signup(self, request, user):
        user.first_name = self.cleaned_data["first_name"]
        user.last_name = self.cleaned_data["last_name"]
        user.save(update_fields=["first_name", "last_name"])
