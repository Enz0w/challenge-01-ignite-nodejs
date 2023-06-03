import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'GET',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { search } = request.query

      const searchData = search
        ? {
            title: search,
            description: search,
          }
        : null

      const tasks = database.select('tasks', searchData)

      return response.end(JSON.stringify(tasks))
    },
  },
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (request, response) => {
      const { title, description } = request.body

      if ((!title || !description)) {
        return response
          .writeHead(400)
          .end(JSON.stringify({ message: 'title and description are required' }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        isCompleted: null,
      }

      database.insert('tasks', task)

      return response.writeHead(201).end()
    },
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params
      const { title, description } = request.body

      if (!title && !description) {
        return response
          .writeHead(400)
          .end(JSON.stringify({ message: 'title or description are required' }))
      }

      const [task] = database.select('tasks', { id })

      if (!task) {
        return response.writeHead(404).end(JSON.stringify('task not found'))
      }

      database.update('tasks', id, {
        title: title ? title : task.title,
        description: description ? description : task.description,
        updated_at: new Date(),
        created_at: task.created_at,
        isCompleted: task.isCompleted,
      })

      return response.writeHead(204).end()
    },
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (request, response) => {
      const { id } = request.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return response.writeHead(404).end(JSON.stringify('task not found'))
      }

      database.delete('tasks', id)

      return response.writeHead(204).end()
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (request, response) => {
      const { id } = request.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        return response.writeHead(404).end(JSON.stringify('task not found'))
      }

      const isTaskCompleted = !!task.isCompleted
      
      const isCompleted = !isTaskCompleted   

      database.update('tasks', id, {
        title: task.title,
        description: task.description,
        updated_at: new Date(),
        created_at: task.created_at,
        isCompleted,
      })

      return response.writeHead(204).end()
    },
  },
]
