class SchemeBuilder {
	constructor() {
		this.schemes = [];
		this.schemesDefinitions = [];
		this.tolerance = 60;
		this.baseColor = '#ffa62e';
		this.autoAdjust = true;
		this.schemesContainer = document.getElementById('schemes');
		
	}
	
	setAutoAdjust(val) {
		this.autoAdjust = val;
		this.calculateAndRender();
	}
	
	setBaseColor(color) {
		this.baseColor = color;
		this.calculateAndRender();
	}
	
	calculateAndRender() {
		let schemesToRender = this.getSchemesWithSimilarColor();
		if(this.autoAdjust) {
			schemesToRender = this.adjustSchemes(schemesToRender);
		}
		this.renderSchemes(schemesToRender);
	}
	
	adjustSchemes(schemes) {
		let adjustedSchemes = [];
		for(let i in schemes) {
			adjustedSchemes.push( this.adjustScheme( this.hexToHSL(this.baseColor), schemes[i]) );
		}
		return adjustedSchemes;
	}
	
	adjustScheme(baseColor, scheme) {
		// let outScheme = {
		// 	schemeDiff : 'Changed',
		// 	colors : []
		// }

		
		// calculate diff between selected color and matched color (mathed is first in scheme)
		// let baseDiff = {
		// 	h : baseColor.h - scheme.colors[0].h,
		// 	s : baseColor.s - scheme.colors[0].s,
		// 	l : baseColor.l - scheme.colors[0].l
		// }
		
		
		
		// calculate scheme color offset (1st color as base, rest of colors as difference in h s l based on first color)
		let baseSchemeColor = scheme.colors[0];
		for(let i in scheme.colors) {
			let schemeColor = scheme.colors[i]
			let colorRecipe = {
					h : schemeColor.h - baseSchemeColor.h,
					s : schemeColor.s - baseSchemeColor.s,
					l : schemeColor.l - baseSchemeColor.l 
				};
			
			scheme.colors[i] = colorRecipe
			
		}
		
		
		// find the highest lightness
		let lowestL = 100;
		let highestL = 0;
		for(let c in scheme.colors) {
			if((baseColor.l + scheme.colors[c].l) >= highestL) {
				highestL = baseColor.l +scheme.colors[c].l;
			} 
			if((baseColor.l + scheme.colors[c].l) <= lowestL) {
				lowestL = baseColor.l + scheme.colors[c].l;
			}
		}

		let dHighest = highestL > 100 ? 100 : highestL;
		let dLowest = lowestL < 0 ? 0 : lowestL;

		let newScheme = {
			schemeDiff : scheme.schemeDiff,
			colors : []
		};
		// calculate new values
		for(let c in scheme.colors) {


			let l = baseColor.l + scheme.colors[c].l; // default 

			l = this.proportion(l,lowestL,highestL,dLowest,dHighest);

			let newColor = this.clampColor({
				h : baseColor.h + scheme.colors[c].h,
				s : baseColor.s + scheme.colors[c].s, 
				l : l
			});
			newScheme.colors.push(newColor);
		}
		return newScheme;
	}
	
	createLeaf(color, textColor = '#000') {
		let leaf = document.createElement('div');
		leaf.style.backgroundColor = color;
		leaf.style.color = textColor;
		leaf.innerText = color;
		return leaf;
	}
	
	clampColor(colorHSL) {
		
		if(colorHSL.h<0){
			colorHSL.h = 360 - colorHSL.h;
		}

		if(colorHSL.h>360){
			colorHSL.h = colorHSL.h - 360;
		}

		if(colorHSL.s<0){
			colorHSL.s = 0;
		}
		if(colorHSL.s>100){
			colorHSL.s = 100;
		}

		if(colorHSL.l<0){
			colorHSL.l = 0;
		}
		if(colorHSL.l>100){
			colorHSL.l = 100;
		}
		
		return colorHSL;
	}
	
	proportion(value, sourceMin, sourceMax, destinationMin, destinationMax) {
		let scale =
			(destinationMax - destinationMin) / (sourceMax - sourceMin);
		let offset = -sourceMin * scale + destinationMin;
		return value * scale + offset;
	}
	
	renderSchemes(schemes) {
		this.schemesContainer.innerHTML = "";
		for(let i in schemes) {
			let schemeHTML = document.createElement('div');
			schemeHTML.classList.add('scheme');
			
			for(let c in schemes[i].colors) {
				schemeHTML.append( this.createLeaf( this.hslToHex( schemes[i].colors[c].h, schemes[i].colors[c].s, schemes[i].colors[c].l ), schemes[i].colors[c].l < 50 ? '#fff' : '#000' ) );
			}
			this.schemesContainer.append(schemeHTML);
		}
		
	}
	
	hslToHex(h, s, l) {
		
		l /= 100;
		const a = s * Math.min(l, 1 - l) / 100;
		const f = n => {
			const k = (n + h / 30) % 12;
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
			return Math.round(255 * color).toString(16).padStart(2, '0');   
		};
		return `#${f(0)}${f(8)}${f(4)}`;
	}
	
	hexToHSL(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		var r = parseInt(result[1], 16);
		var g = parseInt(result[2], 16);
		var b = parseInt(result[3], 16);

		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		} else {
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch(max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		h = Math.round(h * 360);
		s = s*100;
		s = Math.round(s);
		l = l*100;
		l = Math.round(l);
		return { h : h, s: s, l: l, _hex : hex};
	}
	
	compareColors(color1, color2) {
		let hDiff = Math.abs(color1.h - color2.h);
		let sDiff = Math.abs(color1.s - color2.s);
		let lDiff = Math.abs(color1.l - color2.l);
		let result = hDiff + sDiff + lDiff;
		return result;
	}
	
	getSchemesWithSimilarColor() {
		let baseColorHSL = this.hexToHSL( this.baseColor );
		let schemesMatched = [];
		
		// iterate through all schemes
		for(let i in this.schemesDefinitions) {
			// iterate all color in scheme
			let tmpScheme = {colors:[]};
			let matched = false;
			let minimalDiff = this.tolerance;
			for(let c in this.schemesDefinitions[i].colors) {
				// compare each color
				
				let leaf = this.schemesDefinitions[i].colors[c];
				let diff = this.compareColors(baseColorHSL, leaf);
				leaf.diff = diff;
				if(diff< minimalDiff) {
					minimalDiff = diff;
				}
				if(diff <= this.tolerance) {
					matched = true;
				}
				tmpScheme.colors.push(leaf);
			}
			if(matched) {
				tmpScheme.colors.sort((a,b) => a.diff - b.diff);
				tmpScheme.schemeDiff = minimalDiff;
				schemesMatched.push(tmpScheme);
			}
			
		}
		
		schemesMatched.sort((a,b) => a.schemeDiff - b.schemeDiff);
		
		return schemesMatched;
	}
	
	
	loadSchemesDefinitions(schemes) {
		for(let i in schemes) {
			let schemeConverted = {diff: 0, colors: []};
			for(let c in schemes[i]) {
				let leafColor = this.hexToHSL( schemes[i][c] );
				schemeConverted.colors.push( leafColor );
			}
			this.schemesDefinitions.push(schemeConverted);
		}
		this.getSchemesWithSimilarColor();
	}
	
}












let app = new SchemeBuilder();
let schemes = [["01204e","028391","f6dcac","feae6f"],["ff0000","ffa27f","ffe8c5","97be5a"],["850f8d","c738bd","e49bff","f8f9d7"],["ffa62f","ffc96f","ffe8c8","acd793"],["003285","2a629a","ff7f3e","ffda78"],["6f4e37","a67b5b","ecb176","fed8b1"],["799351","a1dd70","f6eec9","ee4e4e"],["f8f4e1","af8f6f","74512d","543310"],["8e3e63","d2649a","f6fab9","cae6b2"],["240750","344c64","577b8d","57a6a1"],["006769","40a578","9dde8b","e6ff94"],["fffae6","ff9f66","ff5f00","002379"],["ace1af","b0ebb4","bff6c3","e0fbe2"],["b5c18e","eadbc8","c7b7a3","f1f1f1"],["6dc5d1","fde49e","feb941","dd761c"],["ffff80","ffaa80","ff5580","ff0080"],["151515","a91d3a","c73659","eeeeee"],["c3ff93","ffdb5c","ffaf61","ff70ab"],["fff9d0","caf4ff","a0deff","5ab2ff"],["7469b6","ad88c6","e1afd1","ffe6e6"],["cde8e5","eef7ff","7ab2b2","4d869c"],["03aed2","68d2e8","fdde55","feefad"],["f3ca52","f6e9b2","0a6847","7aba78"],["fff2d7","ffe0b5","f8c794","d8ae7e"],["32012f","524c42","e2dfd0","f97300"],["640d6b","b51b75","e65c19","f8d082"],["a87676","ca8787","e1acac","ffd0d0"],["fc4100","ffc55a","00215e","2c4e80"],["c40c0c","ff6500","ff8a08","ffc100"],["ff76ce","fdffc2","94ffd8","a3d8ff"],["f5dad2","fcffe0","bacd92","75a47f"],["1a4d2e","4f6f52","e8dfca","f5efe6"],["121481","ffeae3","ffcbcb","ffb1b1"],["153448","3c5b6f","948979","dfd0b8"],["fffbda","ffec9e","ffbb70","ed9455"],["10439f","874ccc","c65bcf","f27bbd"],["e4c59e","af8260","803d3b","322c2b"],["b5c18e","f7dcb9","deac80","b99470"],["1e0342","0e46a3","9ac8cd","e1f7f5"],["fff5e0","8decb4","41b06e","141e46"],["fefaf6","eadbc8","dac0a3","102c57"],["f6f5f2","f0ebe3","f3d0d7","ffefef"],["4793af","ffc470","dd5746","8b322c"],["074173","1679ab","5debd7","c5ff95"],["5bbcff","fffab7","ffd1e3","7ea1ff"],["1c1678","8576ff","7bc9ff","a3ffd6"],["dba979","ecca9c","e8efcf","afd198"],["6c0345","dc6b19","f7c566","fff8dc"],["003c43","135d66","77b0aa","e3fef7"],["a79277","d1bb9e","ead8c0","fff2e1"],["ffebb2","e59be9","d862bc","8644a2"],["86469c","bc7fcd","fb9ad1","ffcdea"],["a34343","e9c874","fbf8dd","c0d6e8"],["b3c8cf","bed7dc","f1eedc","e5ddc5"],["49243e","704264","bb8493","dbafa0"],["0c0c0c","481e14","9b3922","f2613f"],["ffc94a","c08b5c","795458","453f78"],["ffebb2","e9a89b","d875c7","912bbc"],["d20062","d6589f","d895da","c4e4ff"],["f8f6e3","97e7e1","6ad4dd","7aa2e3"],["fa7070","fefded","c6ebc5","a1c398"],["d9edbf","ff9800","2c7865","90d26d"],["fff7fc","8b93ff","5755fe","ff71cd"],["ffaf45","fb6d48","d74b76","673f69"],["e72929","ff5bae","ffe4cf","fffdd7"],["efbc9b","fbf3d5","d6dac8","9cafaa"],["627254","76885b","dddddd","eeeeee"],["401f71","824d74","be7b72","fdaf7b"],["496989","58a399","a8cd9f","e2f4c5"],["008dda","41c9e2","ace2e1","f7eedd"],["ff204e","a0153e","5d0e41","00224d"],["430a5d","5f374b","8c6a5d","eee4b1"],["007f73","4ccd99","ffc700","fff455"],["5356ff","378ce7","67c6e3","dff5ff"],["fda403","e8751a","898121","e5c287"],["222831","31363f","76abae","eeeeee"],["240a34","891652","eabe6c","ffedd8"],["e178c5","ff8e8f","ffb38e","fffdcb"],["fff3c7","fec7b4","fc819e","f7418f"],["b0c5a4","d37676","ebc49f","f1ef99"],["5f5d9c","6196a6","a4ce95","f4edcc"],["124076","7f9f80","f9e897","ffc374"],["b2b377","d2d180","e5e483","f1f5a8"],["eadfb4","9bb0c1","51829b","f6995c"],["114232","87a922","fcdc2a","f7f6bb"],["ffe6e6","e1afd1","ad88c6","7469b6"],["6420aa","ff3ea5","ff7ed4","ffb5da"],["59d5e0","f5dd61","faa300","f4538a"],["a5dd9b","c5ebaa","f6f193","f2c18d"],["5e1675","ee4266","ffd23f","337357"],["35374b","344955","50727b","78a083"],["fba834","333a73","387adf","50c4ed"],["ff407d","ffcad4","40679e","1b3c73"],["0c359e","ee99c2","ffe3ca","f6f5f5"],["ffbe98","feece2","f7ded0","e2bfb3"],["9195f6","b7c9f2","f9f07a","fb88b4"],["b5c0d0","ccd3ca","f5e8dd","eed3d9"],["fff67e","bfea7c","9bcf53","416d19"],["201658","1d24ca","98abee","f9e8c9"],["265073","2d9596","9ad0c2","f1fada"],["8e7ab5","b784b7","e493b3","eea5a6"],["070f2b","1b1a55","535c91","9290c3"],["211951","836fff","15f5ba","f0f3ff"],["000000","f72798","f57d1f","ebf400"],["d7e4c0","c6dcba","bbc3a4","b3a398"],["8cb9bd","fefbf6","ecb159","b67352"],["9b4444","c68484","a3c9aa","eeeeee"],["7f27ff","9f70fd","fdbf60","ff8911"],["211c6a","59b4c3","74e291","eff396"],["fff7f1","ffe4c9","e78895","bed1cf"],["cdfadb","f6fdc3","ffcf96","ff8080"],["944e63","b47b84","caa6a6","ffe7e7"],["40a2e3","fff6e9","bbe2ec","0d9276"],["b4b4b8","c7c8cc","e3e1d9","f2efe5"],["12372a","436850","adbc9f","fbfada"],["e8c872","fff3cf","c9d7dd","637a9f"],["1f2544","474f7a","81689d","ffd0ec"],["0c2d57","fc6736","ffb0b0","efecec"],["eeedeb","e0ccbe","747264","3c3633"],["f28585","ffa447","fffc9b","b7e5b4"],["fdf0d1","ac7d88","85586f","643843"],["6c22a6","6962ad","83c0c1","96e9c6"],["561c24","6d2932","c7b7a3","e8d8c4"],["d04848","f3b95f","fde767","6895d2"],["0a1d56","492e87","37b5b6","f2f597"],["e1f0da","d4e7c5","bfd8af","99bc85"],["000000","0b60b0","40a2d8","f0edcf"],["294b29","50623a","789461","dbe7c9"],["fe7a36","3652ad","280274","e9f6ff"],["dcffb7","ff6868","ffbb64","ffeaa7"],["f5eee6","fff8e3","f3d7ca","e6a4b4"],["030637","3c0753","720455","910a67"],["f9efdb","ebd9b4","9dbc98","638889"],["a94438","d24545","e6baa3","e4debe"],["3e3232","503c3c","7e6363","a87c7c"],["f8f4ec","ff9bd2","d63484","402b3a"],["ff9843","ffdd95","86a7fc","3468c0"],["d9edbf","ffb996","ffcf81","fdffab"],["332941","3b3486","864af9","f8e559"],["faef9b","f6d776","6da4aa","647d87"],["1d2b53","7e2553","ff004d","faef5d"],["80bcbd","aad9bb","d5f0c1","f9f7c9"],["dcf2f1","7fc7d9","365486","0f1035"],["2d3250","424769","7077a1","f6b17a"],["43766c","f8fae5","b19470","76453b"],["92c7cf","aad7d9","fbf9f1","e5e1da"],["3d3b40","525ceb","bfcfe7","f8edff"],["ffe7c1","f3ccf3","e9a8f2","dc84f3"],["ffffec","f1e4c3","c6a969","597e52"],["eef5ff","b4d4ff","86b6f6","176b87"],["11009e","4942e4","e6b9de","fae7f3"],["4f6f52","739072","86a789","d2e3c8"],["f2afef","c499f3","7360df","33186b"],["11235a","596fb7","c6cf9b","f6eca9"],["756ab6","ac87c5","e0aed0","ffe5e5"],["7bd3ea","a1eebd","f6f7c4","f6d6d6"],["7d0a0a","bf3131","ead196","f3edc8"],["52d3d8","3887be","38419d","200e3a"],["5f8670","ff9800","b80000","820300"],["392467","5d3587","a367b1","ffd1e3"],["c3e2c2","eaeccc","dbcc95","cd8d7a"],["ffecd6","4cb9e7","3559e0","0f2167"],["607274","faeed1","ded0b6","b2a59b"],["5f0f40","fb8b24","e36414","9a031e"],["163020","304d30","b6c4b6","eef0e5"],["f3f8ff","e26ee5","7e30e1","49108b"],["88ab8e","afc8ad","eee7da","f2f1eb"],["ffb534","fbf6ee","c1f2b0","65b741"],["711db0","c21292","ef4040","ffa732"],["9bb8cd","fff7d4","eec759","b1c381"],["092635","1b4242","5c8374","9ec8b9"],["fff78a","ffe382","ffc47e","ffad84"],["ff90bc","ffc0d9","f9f9e0","8acdd7"],["527853","f9e8d9","f7b787","ee7214"],["191919","750e21","e3651d","bed754"],["637e76","c69774","f8dfd4","ffefe8"],["df826c","f8ffd2","d0f288","8adab2"],["161a30","31304d","b6bbc4","f0ece5"],["fff5c2","f4f27e","6db9ef","3081d0"],["fed9ed","e7bcde","bb9cc0","67729d"],["c5fff8","96efff","5fbdff","7b66ff"],["fdf7e4","faeed1","ded0b6","bbab8c"],["6b240c","994d1c","e48f45","f5cca0"],["5f6f52","a9b388","fefae0","b99470"],["2b2a4c","b31312","ea906c","eee2de"],["7ed7c1","f0dbaf","dc8686","b06161"],["ecf4d6","9ad0c2","2d9596","265073"],["ff8f8f","eef296","9ade7b","508d69"],["7071e8","c683d7","ed9ed6","ffc7c7"],["eef5ff","9eb8d9","7c93c3","a25772"],["0766ad","29adb2","c5e898","f3f3f3"],["ffc5c5","ffebd8","c7dca7","89b9ad"],["000000","f4dfc8","f4eae0","faf6f0"],["860a35","af2655","a3b763","f3f3f3"],["83a2ff","b4bdff","ffe3bb","ffd28f"],["22092c","872341","be3144","f05941"],["001b79","1640d6","ed5ab3","ff90c2"],["ec8f5e","f3b664","f1eb90","9fbb73"],["f3eeea","ebe3d5","b0a695","776b5d"],["f2ffe9","a6cf98","557c55","fa7070"],["f1eaff","e5d4ff","dcbfff","d0a2f7"],["363062","435585","818fb4","f5e8c7"],["e0f4ff","87c4ff","39a7ff","ffeed9"],["2b3499","ff6c22","ff9209","ffd099"],["164863","427d9d","9bbec8","ddf2fd"],["61a3ba","ffffdd","d2de32","a2c579"],["fffbf5","f7efe5","c3acd0","7743db"],["a9a9a9","fecda6","ff9130","ff5b22"],["ece3ce","739072","4f6f52","3a4d39"],["706233","b0926a","e1c78f","fae7c9"],["0c356a","0174be","ffc436","fff0ce"],["86a789","b2c8ba","d2e3c8","ebf3e8"],["3d30a2","b15eff","ffa33c","fffb73"],["fcf5ed","f4bf96","ce5a67","1f1717"],["00a9ff","89cff3","a0e9ff","cdf5fd"],["f875aa","ffdfdf","fff6f6","aedefc"],["190482","7752fe","8e8ffa","c2d9ff"],["ed7d31","6c5f5b","4f4a45","f6f1ee"],["f5f7f8","f4ce14","495e57","45474b"],["f9b572","99b080","748e63","faf8ed"],["daddb1","b3a492","bfb29e","d6c7ae"],["192655","3876bf","e1aa74","f3f0ca"],["a7d397","f5eec8","d0d4ca","555843"],["fbecb2","f8bdeb","5272f2","072541"],["d6d46d","f4dfb6","de8f5f","9a4444"],["b6fffa","98e4ff","80b3ff","687eff"],["610c9f","940b92","da0c81","e95793"],["363062","4d4c7d","f99417","f5f5f5"],["beadfa","d0bfff","dfccfb","fff8c9"],["0f0f0f","232d3f","005b41","008170"],["0802a3","ff4b91","ff7676","ffcd4b"],["ff8080","ffcf96","f6fdc3","cdfad5"],["cd5c08","f5e8b7","c1d8c3","6a9c89"],["04364a","176b87","64ccc5","dafffb"],["132043","1f4172","f1b4bb","fdf0f0"],["362fd9","1aacac","2e97a7","eeeeee"],["5d12d2","b931fc","ff6ac2","ffe5e5"],["fff2d8","ead7bb","bca37f","113946"],["001524","445d48","d6cc99","fde5d4"],["186f65","b5cb99","fce09b","b2533e"],["ffe4d6","facbea","d988b9","b0578d"],["d2e0fb","f9f3cc","d7e5ca","8eaccd"],["6499e9","9eddff","a6f6ff","befff7"],["2e4374","4b527e","7c81ad","e5c3a6"],["fff5e0","ff6969","c70039","141e46"],["12486b","419197","78d6c6","f5fccd"],["219c90","e9b824","ee9322","d83f31"],["618264","79ac78","b0d9b1","d0e7d2"],["faf2d3","f4e869","3085c3","5cd2e6"],["5b0888","713abe","9d76c1","e5cff7"],["3d0c11","d80032","f78ca2","f9dec9"],["f1efef","ccc8aa","7d7c7c","191717"],["ebe4d1","b4b4b3","26577c","e55604"],["004225","f5f5dc","ffb000","ffcf9d"],["071952","088395","35a29f","f2f7a1"],["ecee81","8ddfcb","82a0d8","edb7ed"],["ffcc70","fffadd","8ecddd","22668d"],["451952","662549","ae445a","f39f5a"],["f8f0e5","eadbc8","dac0a3","0f2c59"],["f0f0f0","213555","4f709c","e5d283"],["57375d","ff3fa4","ff9b82","ffc8c8"],["27005d","9400ff","aed2ff","e4f1ff"],["ffa1f5","bc7af9","f8ff95","a6ff96"],["ef9595","efb495","efd595","ebef95"],["053b50","176b87","64ccc5","eeeeee"],["016a70","ffffdd","d2de32","a2c579"],["952323","a73121","dad4b5","f2e8c6"],["ffbb5c","ff9b50","e25e3e","c63d2f"],["0e21a0","4d2db7","9d44c0","ec53b0"],["94a684","aec3ae","e4e4d0","ffeef4"],["45ffca","feffac","ffb6d9","d67bff"],["9a3b3b","c08261","e2c799","f2ecbe"],["fbf0b2","ffc7ea","d8b4f8","caedff"],["96c291","ffdbaa","ffb7b7","f4eeee"],["793fdf","7091f5","97fff4","fffd8c"],["040d12","183d3d","5c8374","93b1a6"],["faf1e4","cedebd","9eb384","435334"],["191d88","1450a3","337ccf","ffc436"],["fff5e0","ff6969","bb2525","141e46"],["352f44","5c5470","b9b4c7","faf0e6"],["faf1e4","cedebd","9eb384","435334"],["191d88","1450a3","337ccf","ffc436"],["fff5e0","ff6969","bb2525","141e46"],["352f44","5c5470","b9b4c7","faf0e6"],["a8df8e","f3fde8","ffe5e5","ffbfbf"],["79155b","c23373","f6635c","ffba86"],["0c356a","279eff","40f8ff","d5ffd0"],["ebe76c","f0b86e","ed7b7b","836096"],["e19898","a2678a","4d3c77","3f1d38"],["313866","504099","974ec3","fe7be5"],["614bc3","33bbc5","85e6c5","c8ffe0"],["fff3da","dfccfb","d0bfff","beadfa"],["96b6c5","adc4ce","eee0c9","f1f0e8"],["900c3f","c70039","f94c10","f8de22"],["f8f0e5","eadbc8","dac0a3","102c57"],["252b48","445069","5b9a8b","f7e987"],["ffdbc3","9f91cc","5c4b99","3d246c"],["35155d","512b81","4477ce","8cabff"],["c8e4b2","9ed2be","7eaa92","ffd9b7"],["ffc6ac","fff6dc","c4c1a4","9e9fa5"],["241468","9f0d7f","ea1179","f79bd3"],["6f61c0","a084e8","8be8e5","d5ffe4"],["eac696","c8ae7d","765827","65451f"],["272829","61677a","d8d9da","fff6e0"],["fde5ec","fcbaad","e48586","916db3"],["ffeecc","ffddcc","ffcccc","febbcc"],["322653","8062d6","9288f8","ffd2d7"],["cece5a","ffe17b","fd8d14","c51605"],["f6f4eb","91c8e4","749bc2","4682a9"],["fba1b7","ffd1da","fff0f5","ffdbaa"],["e8ffce","acfadf","94add7","7c73c0"],["f11a7b","982176","3e001f","ffe5ad"],["461959","7a316f","cd6688","aed8cc"],["6c3428","ba704f","dfa878","cee6f3"],["0d1282","eeeded","f0de36","d71313"],["f2ee9d","7a9d54","557a46","8c3333"],["faf3f0","d4e2d4","ffcacc","dbc4f0"],["a1ccd1","f4f2de","e9b384","7c9d96"],["1d5d9b","75c2f6","f4d160","fbeeac"],["6528f7","a076f9","d7bbf5","ede4ff"],["40128b","9336b4","dd58d6","ffe79b"],["fce9f1","f1d4e5","73bbc9","080202"],["0079ff","00dfa2","f6fa70","ff0060"],["884a39","c38154","ffc26f","f9e0bb"],["9babb8","eee3cb","d7c0ae","967e76"],["9376e0","e893cf","f3bcc8","f6ffa6"],["30a2ff","00c4ff","ffe7a0","fff5b8"],["11009e","4942e4","8696fe","c4b0ff"],["116d6e","321e1e","4e3636","cd1818"],["f2d8d8","5c8984","545b77","374259"],["ecf8f9","068da9","7e1717","e55807"],["f9f5f6","f8e8ee","fdcedf","f2bed1"],["27374d","526d82","9db2bf","dde6ed"],["b70404","db005b","f79327","ffe569"],["47a992","482121","7a3e3e","eeeeee"],["79e0ee","98eecc","d0f5be","fbffdc"],["025464","e57c23","e8aa42","f8f1f1"],["c4dfdf","d2e9e9","e3f4f4","f8f6f4"],["b799ff","acbcff","aee2ff","e6fffd"],["ffb84c","f266ab","a459d1","2cd3e1"],["f5f0bb","dbdfaa","b3c890","73a9ad"],["643843","99627a","c88ea7","e7cbcb"],["4c4c6d","1b9c85","e8f6ef","ffe194"],["f9fbe7","f0edd4","eccdb4","fea1a1"],["537188","cbb279","e1d4bb","eeeeee"],["fffaf4","d25380","e08e6d","f6c391"],["0c134f","1d267d","5c469c","d4adfc"],["99a98f","c1d0b5","d6e8db","fff8de"],["ff55bb","ffd3a3","fcffb2","b6eafa"],["e5f9db","a0d8b3","a2a378","83764f"],["fff7d4","ffd95a","c07f00","4c3d3d"],["f99b7d","e76161","b04759","8bacaa"],["feff86","b0daff","19a7ce","146c94"],["8294c4","acb1d6","dbdfea","ffead2"],["f6f1f1","afd3e2","19a7ce","146c94"],["be5a83","e06469","f2b6a0","dedea7"],["fff8d6","f7e1ae","a4d0a4","617a55"],["f6ffde","e3f2c1","c9dbb2","aac8a7"],["8b1874","b71375","fc4f00","f79540"],["9e6f21","ffeeb3","b8e7e1","d4fafc"]];

app.loadSchemesDefinitions( schemes );
app.calculateAndRender();