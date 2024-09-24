const [express, cors, path, sha1, Base64, fs] = [ // 引入模块
	require('express'), require('cors'), require('path'),
	require('js-sha1'), require('js-base64'), require('fs')
]
const PORT = 8080 // 设置监听端口
const app = express() // 声明app

app.use(cors(), express.json(), express.static(path.join(__dirname, 'public')))

const readTodos = () => { // 读取数据库
	try {
		const fileData = fs.readFileSync('todos.json', 'utf8')
		return JSON.parse(fileData)
	} catch (err) { return {} }
}

const writeTodos = data => { // 写入数据库（数据）
	try {
		const jsonData = JSON.stringify(data, null, '\t')
		fs.writeFileSync('todos.json', jsonData, 'utf8')
	} catch (err) { throw err }
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/test.html'))) // 定义根路由

app.get('/api/todo/:user', (req, res) => { // 获取列表（用户名）
	try {
		const db = readTodos()
		res.send(db.todos[req.params.user].list)
	} catch (err) { res.status(500).send({}) }
})
/* fetch('/api/todo/UMSCJK').then(response => response.text())
	.then(data => console.log(data)).catch(error => console.error('Error:', error)) */

app.get('/api/todo/:user/:id', (req, res) => { // 获取单个列表项（用户名 + 任务id）
	try {
		const db = readTodos()
		const id = req.params.id.toString()
		res.send(db.todos[req.params.user].list[id])
	} catch (err) { res.status(500).send({}) }
})
/* fetch('/api/todo/UMSCJK/1727100207989').then(response => response.text())
	.then(data => console.log(data)).catch(error => console.error('Error:', error)) */

app.post('/api/todo', (req, res) => { // 添加或修改列表项（用户 + 标题 + 备注）
	try {
		let temp = readTodos()
		const now = new Date().getTime()
		const newTodo = { 'titl': req.body.titl, 'note': req.body.note, 'done': false }
		temp.todos[req.body.user].list[now] = newTodo
		writeTodos(temp)
		res.status(201).send('Todo added successfully')
	} catch (err) { res.status(500).send('Error adding todo') }
})
/* fetch('/api/todo', {
	method: 'POST', headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ user: 'UMSCJK', titl: 'title for test', note: 'note for test' })
}) */

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
/* fetch('/api/todo', {
	method: 'DELETE', headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ user: 'UMSCJK', id: '1727100212729' })
}) */

app.get('/api/user/:name/:pwd', (req, res) => { // 验证用户密码（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const name = req.params.name
		if (!temp.todos[name]) { // 用户不存在
			res.status(404)
		} else if (temp.todos[name].pwd === sha1(Base64.decode(req.params.pwd))) {
			res.status(200).send(true) // 验证正确
		} else {
			res.status(403).send(false) // 用户存在，密码错误
		}
	} catch (err) { res.status(500).send('Error verifying password') }
})
/* fetch('/api/user/UMSCJK/MTE0NTE0').then(response => response.text())
	.then(data => console.log(data)).catch(error => console.error('Error:', error)) */

app.post('/api/user', (req, res) => { // 注册用户（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const name = req.body.name
		if (!temp.todos[name]) {
			temp.todos[name] = {
				'pwd': sha1(Base64.decode(req.body.pwd)),
				'list': {}
			}
		}
		writeTodos(temp)
		res.status(201).send('User registered successfully')
	} catch (err) { res.status(500).send('Error registering') }
})
/* fetch('/api/user', {
	method: 'POST', headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ name: 'test-user', pwd: 'VW1zYzIwMjI=' })
}) */

app.delete('/api/user', (req, res) => { // 注销用户（用户名 + Base64加密后的密码）
	try {
		let temp = readTodos()
		const name = req.body.name
		if (temp.todos[name] && temp.todos[name].pwd === sha1(Base64.decode(req.body.pwd))) {
			delete temp.todos[name]
		}
		writeTodos(temp)
		res.status(201).send('User canceled successfully')
	} catch (err) { res.status(500).send('Error canceling') }
})
/* fetch('/api/user', {
	method: 'DELETE', headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ name: 'test-user', pwd: 'VW1zYzIwMjI=' })
}) */

app.listen(PORT, () => {
	console.clear()
	console.log(`Server is running on http://127.0.0.1:${PORT}`)
})