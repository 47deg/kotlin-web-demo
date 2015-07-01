package ii_conventions

data class MyDate(val year: Int, val month: Int, val dayOfMonth: Int) : Comparable<MyDate>{
    override fun compareTo(other: MyDate): Int{
        if(year != other.year) return year - other.year
        if(month != other.month) return month - other.month
        return dayOfMonth - other.dayOfMonth
    }
}

fun MyDate.rangeTo(other: MyDate) = DateRange(this, other)

class DateRange(override public val start: MyDate, override public val end: MyDate): Iterable<MyDate>, Range<MyDate>{
    override fun iterator(): Iterator<MyDate> = DateIterator(this)
    override fun contains(item: MyDate): Boolean = start <= item && item <= end
}

class DateIterator(private val dateRange: DateRange) : Iterator<MyDate> {
    var current: MyDate = dateRange.start
    override fun next(): MyDate {
        val result = current
        current = current.addTimeIntervals(TimeInterval.DAY, 1)
        return result
    }
    override fun hasNext(): Boolean = current <= dateRange.end
}
