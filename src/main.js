import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

const button = document.getElementById("changeButton");
const message = document.getElementById("message");

button.addEventListener("click", () => {
    message.textContent = "ボタンが押されました！";
});