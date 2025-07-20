export default function StatsCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-xl mr-4">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-semibold text-[#205D9E]">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
