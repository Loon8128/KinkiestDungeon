var PIXIapp = new PIXI.Application({
	antialias: false,
	width: 2000,
	height: 1000,
});

document.body.appendChild(PIXIapp.view);

PIXIapp.stage.addChild(kdcanvas);
PIXIapp.stage.addChild(kdui);

function AssetGet(arg1, arg2, arg3) {
	return undefined;
}

window.onload = function() {
	KinkyDungeonRootDirectory = "Game/";

	// window.onload in index.html
	ServerURL = "foobar";
	CommonIsMobile = CommonDetectMobile();
	TranslationLoad();
	DrawLoad();
	CommonSetScreen("MiniGame", "KinkyDungeon");

	// LoginLoad
	Character = [];
	CharacterNextId = 1;
	CharacterReset(0, "Female3DCG");

	// @ts-ignore
	Player.ArousalSettings = {};
	Player.ArousalSettings.VFXFilter = "VFXFilterHeavy";
	// @ts-ignore
	Player.OnlineSharedSettings = {};
	Player.OnlineSharedSettings.ItemsAffectExpressions = true;
	// @ts-ignore
	Player.AudioSettings = {};
	Player.AudioSettings.Volume = 1;
	// @ts-ignore
	Player.ImmersionSettings = {};

	CurrentCharacter = null;

	// Default keybindings, these are initialized as part of the Player
	KinkyDungeonKeybindings = {
		Down: "KeyS",
		DownLeft: "KeyZ",
		DownRight: "KeyC",
		Left: "KeyA",
		Right: "KeyD",
		Skip: "Space",
		Spell1: "Digit1",
		Spell2: "Digit2",
		Spell3: "Digit3",
		Spell4: "Digit4",
		Spell5: "Digit5",
		Up: "KeyW",
		UpLeft: "KeyQ",
		UpRight: "KeyE",
		Wait: "KeyX",
	};
	if (localStorage.getItem("KinkyDungeonKeybindings") && JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"))) {
		KinkyDungeonKeybindings = JSON.parse(localStorage.getItem("KinkyDungeonKeybindings"));
	}

	KinkyDungeonLoad();

	PIXIapp.ticker.add(() => {
		let Timestamp = performance.now();
		DrawProcess(Timestamp);

		// Increments the time from the last frame
		TimerRunInterval = Timestamp - TimerLastTime;
		TimerLastTime = Timestamp;
		CurrentTime = CurrentTime + TimerRunInterval;

		// At each 1700 ms, we check for timed events (equivalent of 100 cycles at 60FPS)
		if (TimerLastCycleCall + 1700 <= CommonTime()) {
			TimerLastCycleCall = CommonTime();
		}
	});

	//MainRun(0);
};

let TimerRunInterval = 0;
let TimerLastTime = 0;
let CurrentTime = 0;
let TimerLastCycleCall = 0;

/**
 * Main game running state, runs the drawing
 * @param Timestamp
 */
function MainRun(Timestamp: number): void {
	DrawProcess(Timestamp);

	// Increments the time from the last frame
	TimerRunInterval = Timestamp - TimerLastTime;
	TimerLastTime = Timestamp;
	CurrentTime = CurrentTime + TimerRunInterval;

	// At each 1700 ms, we check for timed events (equivalent of 100 cycles at 60FPS)
	if (TimerLastCycleCall + 1700 <= CommonTime()) {
		TimerLastCycleCall = CommonTime();
	}

	// Launches the main again for the next frame
	requestAnimationFrame(MainRun);
}

/**
 * When the user presses a key, we send the KeyDown event to the current screen if it can accept it
 */
function KeyDown(event: KeyboardEvent): void {
	if (event.repeat) return;
	KeyPress = event.keyCode || event.which;
	CommonKeyDown(event);
}

/**
 * When the user clicks, we fire the click event for other screens
 */
function Click(event: MouseEvent): void {
	if (!CommonIsMobile) {
		MouseMove(event);
		CommonClick(event);
	}
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 */
function TouchStart(event: TouchEvent): void {
	if (CommonIsMobile && PIXICanvas) {
		TouchMove(event.touches[0]);
		CommonClick(event);
		CommonTouchList = event.touches;
	}
}

/**
 * When the user touches the screen (mobile only), we fire the click event for other screens
 */
function TouchEnd(event: TouchEvent): void {
	if (CommonIsMobile && PIXICanvas)
		CommonTouchList = event.touches;
}

/**
 * When touch moves, we keep it's position for other scripts
 */
function TouchMove(touch: Touch): void {
	if (PIXICanvas) {
		MouseX = Math.round((touch.pageX - PIXICanvas.offsetLeft) * 2000 / PIXICanvas.clientWidth);
		MouseY = Math.round((touch.pageY - PIXICanvas.offsetTop) * 1000 / PIXICanvas.clientHeight);
	}
}

/**
 * When mouse move, we keep the mouse position for other scripts
 */
function MouseMove(event: MouseEvent) {
	if (PIXICanvas) {
		MouseX = Math.round(event.offsetX * 2000 / PIXICanvas.clientWidth);
		MouseY = Math.round(event.offsetY * 1000 / PIXICanvas.clientHeight);
	}
}

/**
 * When the mouse is away from the control, we stop keeping the coordinates,
 * we also check for false positives with "relatedTarget"
 */
function LoseFocus(event: MouseEvent) {
	if (event.relatedTarget || (event as any).toElement /* toElement is for IE browser compat */) {
		MouseX = -1;
		MouseY = -1;
	}
}