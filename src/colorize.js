(() => {
	let fagListe = { size: 0 };

	chrome.storage.sync.get(['keyFagListe'], result => {
		if (result.keyFagListe) fagListe = result.keyFagListe;
	
		document.querySelectorAll('.s2skemabrikcontent span[data-lectiocontextcard]:first-child').forEach(span => {
			const fag = span.textContent.replaceAll(' ', '_');
	
			if (!fagListe[fag]) {
				const index = fagListe.size;
	
				const r = (90 + index % 5 * 40);
				const g = (130 + index % 3 * 60);
				const b = (150 + index % 2 * 100);
	
				fagListe[fag] = [r, g, b];
				fagListe.size++;
			}
	
			const [ r, g, b ] = fagListe[fag];
			const color = `#${ r.toString(16) }${ g.toString(16) }${ b.toString(16) }`;
	
			const skemaBrikContent = span.parentElement;
			skemaBrikContent.parentElement.style.backgroundImage = 'none';
			skemaBrikContent.parentElement.style.backgroundColor = color;
			skemaBrikContent.style.backgroundColor = color;
	
			const yiq = (r * 299 + g * 587 + b * 114) / 1000;
			if (yiq >= 128) {
				skemaBrikContent.style.color = '#000000';
				skemaBrikContent.style.fontWeight = 'inherit';
			} else {
				skemaBrikContent.style.color = '#ffffff';
				skemaBrikContent.style.fontWeight = 'bold';
			}
		});
	
		chrome.storage.sync.set({ keyFagListe: fagListe });
	});
})();
