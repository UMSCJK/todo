const [express, cors, path, sha1, Base64, fs] = [ // 引入模块
	require('express'), require('cors'), require('path'),
	require('js-sha1'), require('js-base64'), require('fs')
]
const PORT = 8080 // 设置监听端口
const app = express() // 声明app
app.use(cors(), express.json(), express.static(path.join(__dirname, 'public')))
//#region 通用读写函数
const readTodos = () => { // 读取数据库
	try { return JSON.parse(fs.readFileSync('todos.json', 'utf8')) }
	catch { return {} }
}
const writeTodos = data => { // 写入数据库（数据）
	try {
		data.time = new Date().getTime()
		const jsonData = JSON.stringify(data, null, '\t')
		fs.writeFileSync('todos.json', jsonData, 'utf8')
	} catch (err) { throw console.error(err) }
}
// #endregion
//#region 页面路由
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html'))) // 定义根路由
app.get('/api_demo', (req, res) => res.sendFile(path.join(__dirname, 'public/api_demo'))) // API Demo
// #endregion
//#region 任务列表API
app.get('/api/todo/:user', (req, res) => { // 获取列表（用户名）
	try {
		const db = readTodos()
		const user = req.params.user
		if (db.todos[user]) { res.status(200).json(db.todos[user].list) }
		else { res.status(404).json({}) }
	} catch (err) { res.status(500).send({}) }
})
app.get('/api/todo/:user/:id', (req, res) => { // 获取单个列表项（用户名 + 任务id）
	try {
		const db = readTodos()
		const user = req.params.user
		const id = req.params.id
		if (db.todos[user].list[id]) { res.status(200).json(db.todos[user].list[id]) }
		else { res.status(404).json({}) }
	} catch (err) { res.status(500).send({}) }
})
app.post('/api/todo', (req, res) => { // 添加或修改列表项（用户 + 标题 + 备注 + 完成情况）
	try {
		let temp = readTodos()
		const id = req.body.id !== '' ? req.body.id : new Date().getTime()
		const newTodo = { titl: req.body.titl, note: req.body.note, done: req.body.done }
		temp.todos[req.body.user].list[id] = newTodo
		writeTodos(temp)
		res.status(201).json({ [id]: newTodo })
	} catch (err) { res.status(500).send('Error adding todo') }
})
app.delete('/api/todo', (req, res) => { // 删除列表项（用户名 + 任务id）
	try {
		let temp = readTodos()
		const list = temp.todos[req.body.user].list
		const id = req.body.id
		if (list[id]) {
			delete list[id]
			writeTodos(temp)
			res.status(204).send('Todo deleted successfully')
		} else { res.status(404).send('Todo does not exist') }
	} catch (err) { res.status(500).send('Error deleting todo') }
})
// #endregion
//#region 用户操作API
app.get('/api/user/verify/:user/:pwd', (req, res) => { // 验证用户密码（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const user = req.params.user
		const pwd = sha1(Base64.decode(req.params.pwd))
		if (!temp.todos[user]) { res.status(404) } // 用户不存在
		else if (temp.todos[user].pwd === pwd) {
			res.status(200).send(true) // 验证正确
		} else { res.status(403).send(false) } // 用户存在，密码错误
	} catch (err) { res.status(500).send('Error verifying password') }
})
app.post('/api/user/register', (req, res) => { // 注册用户（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const user = req.body.user
		const pwd = sha1(Base64.decode(req.body.pwd))
		if (!temp.todos[user]) {
			temp.todos[user] = { 'pwd': pwd, 'list': {} }
			writeTodos(temp)
			res.status(201).send(`"User ${user}" registered successfully`)
		} else { res.status(200).send(`"User ${user}" already exists`) }
	} catch (err) { res.status(500).send(`Error registering "${user}"`) }
})
app.delete('/api/user/unregister', (req, res) => { // 注销用户（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const user = req.body.user
		const pwd = sha1(Base64.decode(req.body.pwd))
		if (temp.todos[user] && temp.todos[user].pwd === pwd) {
			delete temp.todos[user]
			writeTodos(temp)
			res.status(204).send(`User ${user} unregistered successfully`)
		} else if (temp.todos[user] && temp.todos[user].pwd !== pwd) { // 用户存在，密码错误
			res.status(403).send('Wrong password')
		} else { res.status(404).send(`User ${user} does not exist`) }
	} catch (err) { res.status(500).send('Error canceling') }
})
app.post('/api/user/change_pwd', (req, res) => { // 修改密码（用户名 + 加密后原密码 + 加密后修改密码）
	try {
		let temp = readTodos()
		const user = req.body.user
		const pwd0 = sha1(Base64.decode(req.body.pwd0))
		const pwd1 = sha1(Base64.decode(req.body.pwd1))
		if (temp.todos[user].pwd === pwd0) {
			temp.todos[user].pwd = pwd1
			writeTodos(temp)
			res.status(201).send('Password changed successfully')
		} else { res.status(403).send('Wrong password') }
	} catch (err) { res.status(500).send('Error changing password') }
})
app.post('/api/user/change_username', (req, res) => { // 修改用户名 (原用户名 + 加密后密码 + 新用户名)
	try {
		let temp = readTodos()
		const name0 = req.body.name0
		const name1 = req.body.name1
		const pwd = sha1(Base64.decode(req.body.pwd))
		if (temp.todos[name1]) { // 新用户名已存在
			res.status(403).send(`User ${name1} already exists`)
		} else if (!temp.todos[name0]) { // 原用户名不存在
			res.status(404).send(`User ${name0} does not exist`)
		} else if (!temp.todos[name0].pwd === pwd) { // 密码错误
			res.status(403).send('Wrong password')
		} else {
			temp.todos[name1] = temp.todos[name0]
			delete temp.todos[name0]
			writeTodos(temp)
			res.status(200).send('Username changed successfully')
		}
	} catch (err) { res.status(500).send('Error changing username') }
})
// #endregion
app.listen(PORT, () => {
	console.clear()
	console.log(`Server is running on http://127.0.0.1:${PORT}`)
})