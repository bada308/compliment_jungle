function handleLogin() {
  const email = $("#email").val();
  const password = $("#password").val();

  if (!email) {
    alert("이메일을 입력해주세요!");
    return;
  }

  if (!password) {
    alert("비밀번호를 입력해주세요!");
    return;
  }

  $.ajax({
    url: "/login",
    method: "POST",
    data: { email, password },
    success: function (response) {
      if (response.result === "success") {
        alert("로그인 성공!");
        response.token && $.cookie("token", response.token);
        response.exp && localStorage.setItem("exp", response.exp);
        window.location.href = "/habit";
      } else {
        alert(response?.msg);
      }
    },
  });
}
