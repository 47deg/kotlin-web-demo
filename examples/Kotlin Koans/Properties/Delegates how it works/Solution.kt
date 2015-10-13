import kotlin.properties.ReadWriteProperty

class D {
    var date: MyDate by EffectiveDate()
}

<answer>
class EffectiveDate<R> : ReadWriteProperty<R, MyDate> {

    var timeInMillis: Long? = null

    override fun get(thisRef: R, property: PropertyMetadata): MyDate = timeInMillis!!.toDate()

    override fun set(thisRef: R, property: PropertyMetadata, value: MyDate) {
        timeInMillis = value.toMillis()
    }
}
</answer>