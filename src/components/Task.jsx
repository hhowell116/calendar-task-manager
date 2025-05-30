export default function Task({ task }) {
    return (
        <div className="flex items-center gap-2">
            <span>{task.text}</span>
        </div>
    )
}