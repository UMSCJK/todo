const [express, cors, path, sha1, Base64, fs] = [ // 引入模块
	require('express'), require('cors'), require('path'),
	require('js-sha1'), require('js-base64'), require('fs')
]
const PORT = 8080 // 设置监听端口
const app = express() // 声明app

app.use(cors(), express.json(), express.static(path.join(__dirname, 'public')))

//#region 通用读写函数
const readTodos = () => { // 读取数据库
	try {
		const fileData = fs.readFileSync('todos.json', 'utf8')
		return JSON.parse(fileData)
	} catch (err) { return {} }
}

const writeTodos = data => { // 写入数据库（数据）
	try {
		data.time = new Date().getTime()
		const jsonData = JSON.stringify(data, null, '\t')
		fs.writeFileSync('todos.json', jsonData, 'utf8')
	} catch (err) { throw err }
}
// #endregion

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html'))) // 定义根路由
app.get('/test', (req, res) => res.sendFile(path.join(__dirname, 'public/test.html'))) // 测试页面

//#region 任务列表API
app.get('/api/todo/:user', (req, res) => { // 获取列表（用户名）
	try {
		const db = readTodos()
		res.status(200).json(db.todos[req.params.user].list)
	} catch (err) { res.status(500).send({}) }
})
app.get('/api/todo/:user/:id', (req, res) => { // 获取单个列表项（用户名 + 任务id）
	try {
		const db = readTodos()
		const id = req.params.id.toString()
		res.status(200).json(db.todos[req.params.user].list[id])
	} catch (err) { res.status(500).send({}) }
})
app.post('/api/todo', (req, res) => { // 添加或修改列表项（用户 + 标题 + 备注 + 完成情况）
	try {
		let temp = readTodos()
		const id = req.body.id !== '' ? req.body.id : new Date().getTime()
		const newTodo = { 'titl': req.body.titl, 'note': req.body.note, 'done': req.body.done }
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
		if (list[id]) { delete list[id] }
		writeTodos(temp)
		res.status(204).send('Todo deleted successfully')
	} catch (err) { res.status(500).send('Error deleting todo') }
})
// #endregion

//#region 用户操作API
app.get('/api/user/verify/:user/:pwd', (req, res) => { // 验证用户密码（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const user = req.params.user
		if (!temp.todos[user]) { res.status(404) } // 用户不存在
		else if (temp.todos[user].pwd === sha1(Base64.decode(req.params.pwd))) {
			res.status(200).send(true) // 验证正确
		} else { res.status(403).send(false) } // 用户存在，密码错误
	} catch (err) { res.status(500).send('Error verifying password') }
})
/* fetch('/api/user/UMSCJK/MTE0NTE0').then(response => response.text())
	.then(data => console.log(data)).catch(error => console.error('Error:', error)) */

app.post('/api/user/register', (req, res) => { // 注册用户（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const user = req.body.user
		if (!temp.todos[user]) {
			temp.todos[user] = { 'pwd': sha1(Base64.decode(req.body.pwd)), 'list': {} }
		}
		writeTodos(temp)
		res.status(201).send('User registered successfully')
	} catch (err) { res.status(500).send('Error registering') }
})
/* fetch('/api/user', {
	method: 'POST', headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ user: 'test-user', pwd: 'VW1zYzIwMjI=' })
}) */

app.delete('/api/user/unregister', (req, res) => { // 注销用户（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const user = req.body.user
		const pwd = sha1(Base64.decode(req.body.pwd))
		if (temp.todos[user] && temp.todos[user].pwd === pwd) {
			delete temp.todos[user]
		}
		writeTodos(temp)
		res.status(201).send('User canceled successfully')
	} catch (err) { res.status(500).send('Error canceling') }
})
/* fetch('/api/user', {
	method: 'DELETE', headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ user: 'test-user', pwd: 'VW1zYzIwMjI=' })
}) */

app.post('/api/user/change', (req, res) => {// 修改密码（用户名 + 加密后原密码 + 加密后修改密码）
	try {
		let temp = readTodos()
		const user = req.body.user
		const pwd0 = sha1(Base64.decode(req.body.pwd0))
		const pwd1 = sha1(Base64.decode(req.body.pwd1))
		if (temp.todos[user] && temp.todos[user].pwd === pwd0) {
			temp.todos[user].pwd = pwd1
		}
		writeTodos(temp)
		res.status(201).send('Password changed successfully')
	} catch (err) { res.status(500).send('Error changing password') }
})

// #endregion

app.listen(PORT, () => {
	console.clear()
	console.log(`Server is running on http://127.0.0.1:${PORT}`)
})