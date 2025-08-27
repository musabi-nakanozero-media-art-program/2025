$(document).ready(function(){
	$.getJSON('./js/data.json', function(data){
		// JSON配列をループ
		$.each(data, function(index, item){
			// メインビジュアルがある場合のみ生成
            var keyVisual = item.keyvisual ? `<img src="./img/${item.keyvisual}" alt="mainvisual" class="main-images">` : '';

            // サブビジュアルがある場合のみ生成
            var subVisual1 = item.subvisual01 ? `<img src="./img/${item.subvisual01}" alt="subvisual1">` : '';
            var subVisual2 = item.subvisual02 ? `<img src="./img/${item.subvisual02}" alt="subvisual2">` : '';
            var subVisual3 = item.subvisual03 ? `<img src="./img/${item.subvisual03}" alt="subvisual3">` : '';
            var subVisual4 = item.subvisual04 ? `<img src="./img/${item.subvisual04}" alt="subvisual4">` : '';
		
			var contentDiv = `
				<div class="cotent-index"> ${zeroPad(item.id+1)} </div>
				<div class="content">
					<div class="images">
						<div class="key-visual">
							${keyVisual}
						</div>
						<div class="sub-visuals">
							${subVisual1}
							${subVisual2}
							${subVisual3}
							${subVisual4}
						</div>
					</div>
					<div class="text">
						<p><span class="school">${item.school} ${item.department} ${item.seminar}</span></p>                  
						<p><span class="creator">${item.name}</span></p>
						<p>
							<span class="title">${item.title}</span>
							<span class="duration">&nbsp;&nbsp;(${Math.floor(item.videoduration / 60)}分${item.videoduration % 60}秒)</span>
						</p>
						<p class="othercredits">${toHtmlWithBr(item.othercredits)}</p>
      					<p>${toHtmlWithBr(item.description)}</p>
					</div>
				</div>
			`;

			$('#container').append(contentDiv);
		});
	});
});

function zeroPad(number) {
    return number.toString().padStart(2, '0');
}

function toHtmlWithBr(text) {
  if (text == null) return '';
  // まずHTMLエスケープ
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 改行の揺れを統一：CRLF/CR→LF、そして「文字としての \n」もLFへ
  const unifiedLF = escaped
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\n/g, '\n');

  // 最後に <br> へ
  return unifiedLF.replace(/\n/g, '<br>');
}