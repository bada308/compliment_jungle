/**
 * "칭찬하기" 클릭 이벤트 핸들러
 * @param {클릭된 DOM 요소} element
 * @returns
 */
function handleClickCompliment(element) {
  const habitId = element.getAttribute("key");

  if ($("#emojiSelector").length) {
    $("#emojiSelector").remove();
    $(`#complimentToggleButton${habitId}`).text("칭찬하기");
    return;
  }

  $.ajax({
    type: "GET",
    url: `/compliments/${habitId}`,
    success: function (response) {
      if (response["result"] != "success") {
        alert("칭찬 내역 조회 실패!");
        return;
      } else {
        if (response.msg === "로그인 정보가 존재하지 않습니다.") {
          alert("로그인 정보가 존재하지 않습니다.");
          location.href = "/login";
          return;
        }
      }

      let { _id: complimentId, icon_num: iconNum } = response["data"];

      showEmojiSelector(complimentId, habitId, iconNum);
      $(`#complimentToggleButton${habitId}`).text("접어두기");
    },
  });
}

/**
 * 이모지 선택 영역을 보여주는 함수
 * @param {칭찬 아이디} complimentId
 * @param {습관 아이디} habitId
 * @param {선택한 이모지} iconNum
 */
function showEmojiSelector(complimentId, habitId, icon_num) {
  let emojiSelector = document.createElement("div");
  emojiSelector.data_habit = habitId;
  emojiSelector.data_compliment = complimentId;

  emojiSelector.id = "emojiSelector";
  emojiSelector.className =
    "absolute top-7 right-0 grid grid-cols-5 gap-6 bg-mainYellow p-2 rounded-lg";

  Array.from({ length: 5 }, (_, i) => {
    let emoji = document.createElement("div");

    if (i === icon_num) {
      emoji.innerHTML = `
            <div class="bg-softYellow rounded-md p-1">
                <img
                src="static/emoji/${i}.svg"
                alt="이모지 선택 ${i}"
                width="28"
                />
            </div>`;
    } else {
      emoji.innerHTML = `
            <div class="hover:bg-softYellow rounded-md p-1">
                <img
                src="static/emoji/${i}.svg"
                alt="이모지 선택 ${i}"
                width="28"
                onclick="handleEmojiClick(${i}, ${icon_num})"
                />
            </div>`;
    }
    emojiSelector.appendChild(emoji);
  });
  document
    .querySelector(`#complimentToggle${habitId}`)
    .appendChild(emojiSelector);
}

/**
 * 이모지 선택 이벤트 핸들러
 * @param {선택한 이모지} iconNum
 */
const handleEmojiClick = (iconNum, selected) => {
  const habitId = document.querySelector("#emojiSelector").data_habit;
  const complimentId = document.querySelector("#emojiSelector").data_compliment;

  if (selected) {
    console.log("update");
    updateCompliment(complimentId, iconNum);
  } else {
    console.log("create");
    createCompliment(habitId, iconNum);
  }
};

/**
 * 칭찬 생성 요청
 * @param {습관 아이디} habitId
 * @param {선택한 이모지} iconNum
 */
const createCompliment = (habitId, iconNum) => {
  $.ajax({
    type: "POST",
    url: `/compliments`,
    data: { _id: habitId, icon_num: iconNum },
    success: function (response) {
      if (response["result"] != "success") {
        alert("칭찬하기 실패!");
        return;
      }
      location.reload();
    },
  });
};

/**
 * 칭찬 수정 요청
 * @param {칭찬 아이디} complimentId
 * @param {선택한 이모지} iconNum
 */
const updateCompliment = (complimentId, iconNum) => {
  $.ajax({
    url: `/compliments/${complimentId}`,
    method: "POST",
    data: { icon_num: iconNum },
    success: function (response) {
      if (response["result"] === "success") {
        location.reload();
      } else {
        response.msg && alert(response.msg);
      }
    },
  });
};
