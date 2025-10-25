import { PageFlip } from "https://cdn.skypack.dev/page-flip@2.0.7";

const pageFlip = new PageFlip(document.getElementById("holidayList"), {
	width: 550, // base page width
	height: 733, // base page height

	size: "stretch",
	// set threshold values:
	minWidth: 315,
	maxWidth: 1000,
	minHeight: 420,
	maxHeight: 1350,

	maxShadowOpacity: 0.5,
	showCover: true,
	mobileScrollSupport: false
});

pageFlip.loadFromHTML(document.querySelectorAll(".holiday-item"));

document.querySelector("#prev").addEventListener("click", () => {
	pageFlip.flipPrev();
});

document.querySelector("#next").addEventListener("click", () => {
	pageFlip.flipNext();
});