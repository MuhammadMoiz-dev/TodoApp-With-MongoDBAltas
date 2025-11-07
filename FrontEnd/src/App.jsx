import { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const SERVER_URL = import.meta.env.VITE_SERVER_URL.replace(/\/$/, "");

  useEffect(() => {
    axios
      .get(SERVER_URL)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.todos || [];
        setTodos(data);
      })
      .catch((err) => {
        console.error("Error fetching todos:", err);
        toast.error("Failed to load todos");
      });
  }, [SERVER_URL]);

  const addTodo = async () => {
    if (!text.trim()) return toast.warn("Please enter a task!");
    try {
      const res = await axios.post(SERVER_URL, { text });
      setTodos([...todos, res.data]);
      setText("");
      toast.success("Todo added successfully!");
    } catch (err) {
      console.error("Error adding todo:", err);
      toast.error("Failed to add todo");
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`${SERVER_URL}/${id}`, { completed: !completed });
      setTodos(todos.map((t) => (t._id === id ? res.data : t)));
      toast.info("Todo status updated!");
    } catch (err) {
      console.error("Error toggling todo:", err);
      toast.error("Failed to update status");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${SERVER_URL}/${id}`);
      setTodos(todos.filter((t) => t._id !== id));
      toast.success("Todo deleted!");
    } catch (err) {
      console.error("Error deleting todo:", err);
      toast.error("Failed to delete todo");
    }
  };

  const startEdit = (todo) => {
    setEditId(todo._id);
    setEditText(todo.text);
  };

  const updateTodo = async () => {
    if (!editText.trim()) return toast.warn("Please enter text before saving!");
    try {
      const res = await axios.put(`${SERVER_URL}/${editId}`, { text: editText });
      setTodos(todos.map((t) => (t._id === editId ? res.data : t)));
      setEditId(null);
      setEditText("");
      toast.success("Todo updated successfully!");
    } catch (err) {
      console.error("Error editing todo:", err);
      toast.error("Failed to update todo");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center  from-blue-100 to-indigo-200 py-10 px-4">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <h1 className="text-5xl font-extrabold text-transparent bg-clip-text  from-blue-600 to-indigo-700 mb-8 drop-shadow-md">
        My To-Do List
      </h1>

      {/* Add Task */}
      <div className="bg-white shadow-lg rounded-xl flex w-full max-w-md overflow-hidden mb-8 border border-gray-200">
        <input
          className="flex-1 p-3 outline-none text-gray-700"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="✏️ Add a new task..."
        />
        <button
          onClick={addTodo}
          className=" from-blue-600 bg-black to-indigo-700 text-white px-6 font-medium "
        >
          Add
        </button>
      </div>

      {/* Todo List */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-5 border border-gray-100">
        {Array.isArray(todos) && todos.length > 0 ? (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo._id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-all shadow-sm"
              >
                {editId === todo._id ? (
                  <>
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border border-gray-300 p-2 rounded-md w-48 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={updateTodo}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-md transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      onClick={() => toggleTodo(todo._id, todo.completed)}
                      className={`cursor-pointer select-none text-lg font-medium ${todo.completed
                        ? "line-through text-gray-400"
                        : "text-gray-800 hover:text-indigo-600"
                        }`}
                    >
                      {todo.text}
                    </span>
                    <div className="flex gap-3 text-lg">
                      <button
                        onClick={() => startEdit(todo)}
                        className="text-blue-500 hover:text-blue-700 transition-all"
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteTodo(todo._id)}
                        className="text-red-500 hover:text-red-700 transition-all"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-6 italic">No tasks yet — start by adding one!</p>
        )}
      </div>
    </div>
  );
}

export default App;
