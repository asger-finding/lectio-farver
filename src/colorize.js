(() => {

	let colors = {};

	const rgbToHex = (r, g, b) => `#${ r.toString(16).padStart(2, '0') }${ g.toString(16).padStart(2, '0') }${ b.toString(16).padStart(2, '0') }`;

	const getCurrentClass = () => {
		const regex = /,\s*([^-]+)/;
		const identifier = document.title.match(regex);

		if (identifier) {
			const extract = identifier[1].trim();
			if (extract.length === 0) return null;

			return extract;
		}
		return null;
	}

	const setModuleColor = (element, rgb) => {
		const [ r, g, b ] = rgb;
		const color = rgbToHex(r, g, b);

		console.log(element, rgb, color);

		element.parentElement.style.backgroundImage = 'none';
		element.parentElement.style.backgroundColor = color;
		element.style.backgroundColor = color;

		const yiq = (r * 299 + g * 587 + b * 114) / 1000;
		if (yiq >= 128) {
			element.style.color = '#000000';
			element.style.fontWeight = 'inherit';
		} else {
			element.style.color = '#ffffff';
			element.style.fontWeight = 'bold';
		}
	}

	chrome.storage.local.set({
		currentClass: getCurrentClass()
	});

	chrome.storage.sync.get('assignedColors', ({ assignedColors }) => {
		if (assignedColors) colors = assignedColors;
	
		document.querySelectorAll('.s2skemabrikcontent span[data-lectiocontextcard]:first-child').forEach(span => {
			const subject = span.textContent.replaceAll(' ', '_');
	
			if (!colors[subject]) {
				const index = Object.keys(colors).length;
	
				const r = (90 + index % 5 * 40);
				const g = (130 + index % 3 * 60);
				const b = (150 + index % 2 * 100);
	
				colors[subject] = [r, g, b];
			}

			const subjectElement = span.parentElement;
			setModuleColor(subjectElement, colors[subject]);
		});
	
		chrome.storage.sync.set({ assignedColors: colors });
	});

})();
