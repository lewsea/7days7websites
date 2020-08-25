music_name = "music.mp3"
let play_btn = document.querySelector("#play");
let prev_btn = document.querySelector("#pre");
let next_btn = document.querySelector("#next");
let range = document.querySelector("#range");
let play_img = document.querySelector("#play_img")
let total_time = 0;
let currentTime = 0;
let isPlaying = false;
let song = new Audio();
window.onload = playSong;

function playSong() {
    song.src = music_name;
    play_btn.addEventListener('click', function () {
        if (!isPlaying) {
            song.play();
            song.volume = .1;
            isPlaying = true;
            total_time = song.duration;
            range.max = total_time;
            play_img.src = "img/pause-white-18dp.svg";
        } else {
            song.pause();
            isPlaying = false;
            play_img.src = "img/play_circle_filled-white-18dp.svg";
        }
        song.addEventListener('ended', function () {
            song.currentTime = 0
            song.pause();
            isPlaying = false;
            range.value = 0;
            play_img.src = "img/play_circle_filled-white-18dp.svg";
        })
        song.addEventListener('timeupdate', function () {
            range.value = song.currentTime;
        })
        range.addEventListener('change', function () {
            song.currentTime = range.value;
        })

    })
}