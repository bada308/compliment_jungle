$(document).ready(function () {
  $("#habitCreate").css("display", "none");
});

function handleToggle() {
  $("#habitCreate").toggle();
  if ($("#habitCreate").css("display") === "none") {
    $("#habitAddToggleText").text("추가하기");
  } else {
    $("#habitAddToggleText").text("접어두기");
  }
}

function handleCountUp(habitId) {
  $.ajax({
    type: "POST",
    url: `/habits/count/${habitId}`,
    success: function (response) {
      if (response.result === "success") {
        location.reload();
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

  console.log(habitName, habitGoal, habitTag);

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

function handleDeleteHabit(habitId) {
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
