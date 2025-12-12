export default function Card({title, body, footer}){
return (
<div className="p-4 bg-white rounded shadow">
<h3 className="font-semibold">{title}</h3>
<p className="text-sm text-gray-600">{body}</p>
<div className="text-xs text-gray-500 mt-2">{footer}</div>
</div>
)
}