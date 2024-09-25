const copy = txt => {
	const $i = $('<textarea>').val(txt), x = scrollX, y = scrollY
	$i.appendTo($('body')).focus().select()
	document.execCommand('copy')
	$i.remove()
	scroll(x, y)
}
//#region 任务列表API
$('#get-list-fetch').click(() => { // 获取列表
	const user = $('#get-list-user').val()
	$.get(`/api/todo/${user}`, data => console.log(data))
})
$('#get-single-fetch').click(() => { // 获取任务
	const user = $('#get-single-user').val()
	const id = $('#get-single-id').val()
	$.get(`/api/todo/${user}/${id}`, data => console.log(data))
})
$('#add-fetch').click(() => { // 增改任务
	const newTodo = {
		user: $('#add-user').val(),
		id: $('#add-id').val(),
		titl: $('#add-titl').val(),
		note: $('#add-note').val(),
		done: $('#add-done').prop('checked')
	}
	$.ajax({
		url: '/api/todo', type: 'POST', contentType: 'application/json; charset=utf-8',
		data: JSON.stringify(newTodo), success: data => console.log(data)
	})
})
$('#del-fetch').click(() => { // 删除任务
	$.ajax({
		url: '/api/todo', type: 'DELETE', contentType: 'application/json; charset=utf-8', processData: false,
		data: JSON.stringify({ user: $('#del-user').val(), id: $('#del-id').val() })
	})
})
// #endregion
//#region TODO:用户操作API



// #endregion
//#region 文本工具
$('#b64-en-txt').on('keyup', () => $('#b64-en-out').val(Base64.encode($('#b64-en-txt').val())))
$('#b64-de-txt').on('keyup', () => { try { $('#b64-de-out').val(Base64.decode($('#b64-de-txt').val())) } catch (err) { $('#b64-de-out').val('错误') } })
$('#sha1-txt').on('keyup', () => $('#sha1-out').val(sha1($('#sha1-txt').val())))
$('#b64-en-copy').click(() => copy($('#b64-en-out').val()))
$('#b64-de-copy').click(() => copy($('#b64-de-out').val()))
$('#sha1-copy').click(() => copy($('#sha1-out').val()))
// #endregion