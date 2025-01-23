addEventListener('load', () => {
	let fagListe = { size: 0 };

	const hexToRgb = hex => ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];

	const executeColorScript = () => chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		if (tabs[0].id) {
			chrome.scripting.executeScript({
				target: { tabId: tabs[0].id },
				files: ['colorize.js']
			});
		}
	});
	
	chrome.storage.sync.get(['keyFagListe'], result => {
		if (result.keyFagListe) fagListe = result.keyFagListe;
	
		for (const fag in fagListe) {
			if (fag === 'size') return;
	
			const [ r, g, b ] = fagListe[fag];
			const color = `#${ r.toString(16) }${ g.toString(16) }${ b.toString(16) }`;
	
			const wrapper = document.createElement('div');
			const input = document.createElement('input');
			const label = document.createElement('label');

			wrapper.classList.add('color');
	
			input.type = 'color';
			input.id = fag;
			input.value = color;
	
			label.setAttribute('for', fag);
			label.innerText = fag.replaceAll('_', ' ');
	
			input.addEventListener('change', evt => {
				const newColorHex = evt.target.value;
				const rgb = hexToRgb(newColorHex);
	
				fagListe[fag] = rgb;
	
				chrome.storage.sync.set({ keyFagListe: fagListe }, () => executeColorScript());
			});
	
			wrapper.append(input, label);
	
			document.getElementById('colors').append(wrapper);
		}
	});

	document.getElementById('reset').addEventListener('mouseup', () => {
		chrome.storage.sync.clear(() => {
			executeColorScript();
			window.close();
		});
	})
});
