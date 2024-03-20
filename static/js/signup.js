$(document).ready(function () {
  localStorage.removeItem("profileNum");
});

function handleProfileSelect(selected) {
  let profileItem = document.getElementsByClassName("profileItem");
  profileItem[selected].classList.remove("border-white");
  profileItem[selected].classList.add("border-mainGreen");

  // selected 아닌 거 border 지우기
  for (let i = 0; i < profileItem.length; i++) {
    if (i != selected) {
      profileItem[i].classList.remove("border-mainGreen");
      profileItem[i].classList.add("border-white");
    }
  }

  localStorage.removeItem("profileNum");
  localStorage.setItem("profileNum", selected);
}

function handleSignup() {
  const profileNum = localStorage.getItem("profileNum");
  if (profileNum === null) {
    alert("프로필을 선택해주세요!");
    return;
  }

  const nickname = document.getElementById("nickname").value;
  if (nickname === "") {
    alert("닉네임을 입력해주세요!");
    return;
  }

  const email = document.getElementById("email").value;
  if (email === "") {
    alert("이메일을 입력해주세요!");
    return;
  }

  const password = document.getElementById("password").value;
  if (password === "") {
    alert("비밀번호를 입력해주세요!");
    return;
  }

  const confirmPassword = document.getElementById("confirmPassword").value;
  if (confirmPassword === "") {
    alert("비밀번호 확인을 입력해주세요!");
    return;
  }

  if (password !== confirmPassword) {
    alert("비밀번호가 일치하지 않습니다!");
    return;
  }

  $.ajax({
    url: "/signup",
    method: "POST",
    data: {
      image_num: profileNum,
      nickname,
      email,
      password,
    },
    success: function (response) {
      if (response.result === "success") {
        alert("회원가입 성공!");
        window.location.href = "/login";
      } else {
        alert(response?.msg);
      }
    },
  });
}
