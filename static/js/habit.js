$(document).ready(function () {
  $.ajax({
    url: "/habits",
    method: "GET",
    success: function (response) {
      if (response.result === "success") {
        response.data && addHabit(response.data);
      } else {
        if (response.msg === "로그인 정보가 존재하지 않습니다.") {
          alert("로그인 정보가 존재하지 않습니다.");
          location.href = "/login";
          return;
        }
      }
    },
  });
});

function addHabit(habits) {
  habits.forEach((habit) => {
    const { _id: habitId, name, count, goal, tag } = habit;

    const habitCard = `<section
          key=${habitId}
          data-count=${count}
          data-goal=${goal}
          onmouseover="changeCheerupMessage(this)"
          class="rounded-lg w-full flex flex-col p-6 bg-softGreen border-2 border-mainGreen gap-2 relative group"
        >
          <div class="flex justify-between items-center">
            <div class="flex flex-col gap-3">
              <span class="text-xl font-bold text-black">${name}</span>
              <span class="text-sm text-gray-500"
                >목표 ${goal} ・ ${tag}</span
              >
            </div>
            <div
              key=${habitId}
              class="border-4 rounded-full w-12 h-12 border-mainGreen flex justify-center items-center group active:bg-mainGreen transition-colors duration-200"
              onclick="handleCountUp(this)"
            >
              <span
                class="font-bold text-mainGreen group-active:text-white transition-colors duration-200 cursor-pointer"
                >${count}</span
              >
            </div>
          </div>
          <img
            key=${habitId}
            id="deleteButton"
            src="static/image/cross.svg"
            width="14"
            class="absolute right-3 top-3 cursor-pointer invisible group-hover:visible"
            alt="습관 삭제하기"
            onclick="handleDeleteHabit(this)"
          />
          <div
            id="cheerupMessage${habitId}"
            class="absolute group-hover:visible invisible text-sm text-gray-500 -bottom-8 p-2 rounded-lg w-full text-center"
          ></div>
        </section>`;

    $("#habitContainer").append(habitCard);
  });
}

function handleToggle() {
  $("#habitCreate").toggle();
  if ($("#habitCreate").css("display") === "none") {
    $("#habitAddToggleText").text("추가하기");
  } else {
    $("#habitAddToggleText").text("접어두기");
  }
}

function handleCountUp(element) {
  const habitId = element.getAttribute("key");

  $.ajax({
    type: "POST",
    url: `/habits/count/${habitId}`,
    success: function (response) {
      if (response.result === "success") {
        location.reload();
      } else {
        alert(response?.msg);
      }
    },
  });
}

function handleCreateHabit() {
  if (!confirm("습관을 추가하시겠습니까?")) {
    return;
  }

  const habitName = $("#habitName").val();
  const habitGoal = $("#habitGoal").val();
  const habitTag = $("#habitTag").val();

  if (!habitName) {
    alert("습관 이름을 입력해주세요!");
    return;
  }

  if (!habitGoal) {
    alert("목표 횟수를 입력해주세요!");
    return;
  }

  $.ajax({
    type: "POST",
    url: `/habits`,
    data: {
      name: habitName,
      goal: Number(habitGoal),
      tag: habitTag,
    },
    success: function (response) {
      if (response.result === "success") {
        location.reload();
      }
    },
  });
}

function handleCancelCreate() {
  if (!confirm("습관 추가를 취소하시겠습니까?")) {
    return;
  }
  $("#habitCreate").toggle();
  $("#habitAddToggleText").text("추가하기");
  $("#habitName").val("");
  $("#habitGoal").val("");
  $("#habitTag").val("");
}

function handleDeleteHabit(element) {
  const habitId = element.getAttribute("key");

  if (!confirm("습관을 삭제하시겠습니까?")) {
    return;
  }
  $.ajax({
    url: `/habits/${habitId}`,
    method: "POST",
    success: function (response) {
      if (response.result === "success") {
        location.reload();
      }
    },
  });
}

function changeCheerupMessage(element) {
  const habitId = element.getAttribute("key");
  const count = element.getAttribute("data-count");
  const goal = element.getAttribute("data-goal");

  let message = MESSAGE.default;
  if (count >= goal / 2) {
    message = MESSAGE.half;
  }
  if (count >= goal * 0.8) {
    message = MESSAGE.almost(goal - count);
  }
  $(`#cheerupMessage${habitId}`).text(message);
}

const MESSAGE = {
  default: "잘 하고 있어요! 목표에 한 발짝 더 다가가세요!",
  half: "목표의 절반을 달성했어요! 조금만 더 힘내세요!",
  almost: (remaining) => `목표까지 ${remaining}번 남았어요! 화이팅!`,
};
