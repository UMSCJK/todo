const copy = txt => {
	var textarea = $('<textarea>').val(txt).css('position', 'fixed').appendTo('body')
	textarea[0].select()
	document.execCommand('copy')
	textarea.remove()
}
// #region 任务列表API
$('#get-list-fetch').click(() => { // 获取列表: GET `/api/todo/${user}`
	const user = $('#get-list-user').val()
	$.get(`/api/todo/${user}`, data => console.log(data))
})
$('#get-single-fetch').click(() => { // 获取任务: GET `/api/todo/${user}/${id}`
	const user = $('#get-single-user').val()
	const id = $('#get-single-id').val()
	$.get(`/api/todo/${user}/${id}`, data => console.log(data))
})
$('#add-fetch').click(() => { // 增改任务: POST '/api/todo'
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
$('#del-fetch').click(() => { // 删除任务: DELETE '/api/todo'
	$.ajax({
		url: '/api/todo', type: 'DELETE', contentType: 'application/json; charset=utf-8', processData: false,
		data: JSON.stringify({ user: $('#del-user').val(), id: $('#del-id').val() })
	})
})
// #endregion
// #region 用户操作API
$('#verify-fetch').click(() => { // 验证密码: GET `/api/user/verify/${user}/${pwd}`
	const user = $('#verify-user').val()
	const pwd = $('#verify-pwd').val()
	$.get(`/api/user/verify/${user}/${pwd}`, data => console.log(data))
})
$('#register-fetch').click(() => { // 注册用户: POST '/api/user/register'
	const user = $('#register-user').val()
	const pwd = $('#register-pwd').val()
	$.ajax({
		url: '/api/user/register', type: 'POST', contentType: 'application/json; charset=utf-8',
		data: JSON.stringify({ user: user, pwd: pwd }), success: data => console.log(data)
	})
})
$('#unregister-fetch').click(() => { // 注销用户: DELETE '/api/user/unregister'
	const user = $('#unregister-user').val()
	const pwd = $('#unregister-pwd').val()
	$.ajax({
		url: '/api/user/unregister', type: 'DELETE', contentType: 'application/json; charset=utf-8',
		data: JSON.stringify({ user: user, pwd: pwd }), success: data => console.log(data)
	})
})
$('#change-pwd-fetch').click(() => { // 修改密码: POST '/api/user/change_pwd'
	const user = $('#change-pwd-user').val()
	const pwd0 = $('#change-pwd-pwd0').val()
	const pwd1 = $('#change-pwd-pwd1').val()
	$.ajax({
		url: '/api/user/change_pwd', type: 'POST', contentType: 'application/json; charset=utf-8',
		data: JSON.stringify({ user: user, pwd0: pwd0, pwd1: pwd1 }), success: data => console.log(data)
	})
})
$('#change-name-fetch').click(() => { // 修改密码: POST '/api/user/change_username'
	const name0 = $('#change-name-name0').val()
	const name1 = $('#change-name-name1').val()
	const pwd = $('#change-name-pwd').val()
	$.ajax({
		url: '/api/user/change_username', type: 'POST', contentType: 'application/json; charset=utf-8',
		data: JSON.stringify({ name0: name0, name1: name1, pwd: pwd }), success: data => console.log(data)
	})
})
// #endregion
// #region 文本实用工具
const util_refresh = () => {
	const txt = $('#util-txt').val()
	const sel = $('#util-sel').val()
	let b64_de
	try { b64_de = Base64.decode(txt) } catch { b64_de = 'Error!' }
	const result = { 'b64-en': Base64.encode(txt), 'b64-de': b64_de, 'sha1': sha1(txt) }
	$('#util-out').val(result[sel])
}
$('#util-txt').on('keyup', () => util_refresh())
$('#util-sel').on('change', () => util_refresh())
$('#util-copy').click(() => copy($('#util-out').val()))
// #endregion