let colors = {};

const hexToRgb = hex => ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];

const executeColorScript = () => chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
	if (tabs[0].id) {
		chrome.scripting.executeScript({
			target: { tabId: tabs[0].id },
			files: ['colorize.js']
		});
	}
});

const createItem = (subjectIdentifier, rgb) => {
	const [ r, g, b ] = rgb;
	const color = `#${ r.toString(16) }${ g.toString(16) }${ b.toString(16) }`;

	const wrapper = document.createElement('div');
	const input = document.createElement('input');
	const label = document.createElement('label');
	const remove = document.createElement('div');
	const trashIcon = document.createElement('img');

	wrapper.id = subjectIdentifier;
	wrapper.classList.add('color');

	input.type = 'color';
	input.id = `${subjectIdentifier}_input`;
	input.value = color;

	label.setAttribute('for', input.id);
	label.innerText = subjectIdentifier.replaceAll('_', ' ');

	input.addEventListener('change', evt => {
		const newColorHex = evt.target.value;
		const rgb = hexToRgb(newColorHex);

		colors[subjectIdentifier] = rgb;

		chrome.storage.sync.set({ assignedColors: colors }, () => executeColorScript());
	});

	remove.classList.add('remove');
	trashIcon.src = './trash.svg';

	remove.addEventListener('mouseup', ({ currentTarget }) => {
		if (currentTarget) {
			chrome.storage.sync.get('assignedColors', ({ assignedColors }) => {
				if (assignedColors) colors = assignedColors;

				delete colors[currentTarget.parentElement.id];

				chrome.storage.sync.set({
					assignedColors: colors
				});

				currentTarget.parentElement.remove();
			});
		}
	});

	remove.append(trashIcon);
	wrapper.append(input, label, remove);

	return wrapper;
}

addEventListener('load', () => {
	chrome.storage.sync.get('assignedColors', ({ assignedColors }) => {
		if (assignedColors) colors = assignedColors;

		chrome.storage.local.get('currentClass', ({ currentClass }) => {
			const colorWrapper = document.getElementById('colors');
			if (currentClass) {
				const currentClassSubjects = [];
				const otherClassSubjects = [];
				for (const subject in colors) {
					const item = createItem(subject, colors[subject]);
	
					if (subject.startsWith(currentClass)) currentClassSubjects.push(item)
					else otherClassSubjects.push(item);
				}

				colorWrapper.append(...[
					...currentClassSubjects,
					document.createElement('hr'),
					...otherClassSubjects
				]);
			} else {
				for (const subject in colors) colorWrapper.append(createItem(subject, colors[subject]));
			}
		});
	});

	document.getElementById('reset').addEventListener('mouseup', () => {
		chrome.storage.sync.clear(() => {
			executeColorScript();
			window.close();
		});
	});
});
