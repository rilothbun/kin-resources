let NPC_FIELD_NAMES = ["name", "body", "mind", "soul",
"maximum_wound_points", "resistances", "defence", "planar_origin",
"description"];

let CHARACTER_FIELD_NAMES = ["name", "unspent-proficiency-points", "level", "luck", "description",
	"max-wound-points", "defence", "action-points", "energy-points",
	"body", "mind", "soul",
	"agility", "thievery", "stealth", "endurance", "threaten",
	"convince", "alchemy", "search", "scholar", "nature",
	"liar", "wild-empathy", "social-instinct", "perform", "create"
];

let nbr_tnp = 0;

function saveTextToMarkdown(data, filename, type) {
	var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }

}

function pdfButtonClicked() {
	savePdfWithPdfJS();
}

/**
 *
 * This doesn't work well. I've made several attempts at getting a good pdf, but it has met only failure so far.
 *
 */
function savePdfWithPdfJS() {
	let doc = new jsPDF({
		orientation: 'l',
		unit: 'mm',
		format: 'a4'
	});
	let elem = document.getElementById("npc-table");
	let width = elem.offsetWidth;
	let height = elem.offsetHeight;
	console.log(width, height);
	let ratio = elem.offsetHeight / elem.offsetWidth;
	console.log(ratio);
	html2canvas(elem, {
		height: height,
		width: width,
		dpi: 300,
		scale: 3,
		onrendered: function(canvas) {
			console.log("Tru");
			let image = canvas.toDataURL("image/jpeg", 1);
			let doc = new jsPDF(); //'L', "px", [elem.offsetWidth, elem.offsetHeigh]);
			var width = doc.internal.pageSize.getWidth();
			var height = doc.internal.pageSize.getHeight();
			height = ratio * width;
			doc.addImage(image, 'JPEG', 0, 0, width-20, height-10);
			console.log("Document made, will be saved...");
			doc.output("dataurlnewwindow");
			doc.save("test.pdf");
		}
	});
	//doc.html(elem, { callback: function(doc) {doc.save("test.pdf")}, width: 270, height: 190, windowWidth: 270 });
	doc.autoPrint();
  doc.output("dataurlnewwindow");
}

/**
 *
 * Export the data to a Markdown file usable byZola, the static site generator I use.
 *
 */
function mdButtonClicked() {
	let name = document.getElementById("npc-name").textContent.trim();
	let date = new Date().toISOString();
	let body = document.getElementById("npc-body").textContent.trim();
	let mind = document.getElementById("npc-mind").textContent.trim();
	let soul = document.getElementById("npc-soul").textContent.trim();
	let maximum_wound_points= document.getElementById("npc-maximum_wound_points").textContent.trim();
	let resistances = document.getElementById("npc-resistances").textContent.trim();
	let defence = document.getElementById("npc-defence").textContent.trim();
	let planar_origin = document.getElementById("npc-planar_origin").textContent.trim();
	let description = document.getElementById("npc-description").textContent.trim();
	let tnp_table = document.getElementById("npc-traits_and_proficiencies").firstElementChild;
	let tnp_list = tnp_table.getElementsByTagName("li")
	//console.log(tnp_list);
	console.log(body);

	let traits_and_proficiencies_block = "";
	for (i=0 ; i<tnp_list.length ; i++) {
		console.log(tnp_list[i]);
		tnp_key = tnp_list[i].firstChild && tnp_list[i].firstChild.textContent ? tnp_list[i].firstChild.textContent.slice(0, -1).trim() : "";
		tnp_val = tnp_list[i].lastChild && tnp_list[i].lastChild.textContent ? tnp_list[i].lastChild.textContent.trim() : "";
		console.log("key" + tnp_key + "\nval" + tnp_val);
		//console.log(tnp_list[i].firstChild);
		//console.log(tnp_list[i].firstChild.text);
		traits_and_proficiencies_block += `\n${tnp_key} = "${tnp_val}"`;
	}

	let text = `
+++
title = "${name}"
date = "${date}"
template = "npc.html"

[extra]
body = "${body}"
mind = "${mind}"
soul = "${soul}"
maximum_wound_points = "${maximum_wound_points}"
resistances = "${resistances}"
defence = "${defence}"
planar_origin = "${planar_origin}"
description = "${description}"

[extra.traits_proficiencies]
${traits_and_proficiencies_block}
+++
`
	console.log(text);
	saveTextToMarkdown(text, "npc.md", "text/plain");
}

$(document).ready(function(){

	NPC_FIELD_NAMES.forEach(function(name, index, array) {
		$("#user-"+name).change(function() {
			$("#npc-"+name).text($("#user-"+name).val());
		})
	});

	CHARACTER_FIELD_NAMES.forEach(function(name, index, array) {
		$("#input-character-"+name).change(function() {
			$("#character-"+name).text($("#input-character-"+name).val());
		})
	});

	$("#user-traits_and_proficiencies-nbr").change(function() {
		nbr_tnp = $("#user-traits_and_proficiencies-nbr").val();
		let cur_nbr = $("#list-tnp li").length;
		if (nbr_tnp <= 0) {
			// remove all li
				$("#list-tnp li").remove();
		}	else if (cur_nbr < nbr_tnp) {
			let target = nbr_tnp - cur_nbr;
			for (i = 0; i < target ; i++) {
				let li_table = $(`<li></li>`);
				let input_key = $(`<input type="text" value="Name">`);
				let input_val = $(`<textarea rows="3", cols="20" >Description</textarea>`);
				let li = $(`<li></li>`).on("change", function() {

					let tnp_key = input_key.val();
					let tnp_val = input_val.val();
					li_table.html(`<strong>${tnp_key} :</strong> ${tnp_val}`)
				});
				li.append(input_key, input_val);

				$("#list-tnp").append(li);
				$("#npc-traits_and_proficiencies ul").append(li_table);
			}
		} else if (cur_nbr > nbr_tnp) {
			let target = cur_nbr - nbr_tnp;
			for (i = 0; i < target ; i++) {
				console.log($("#list-tnp li:last"));
				$("#list-tnp li:last").remove();
			}
		}
	});
})
