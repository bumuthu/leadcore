export function ValidateFields(data, model) {
    type MakeRequired<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> & { [P in K]-?: Exclude<T[P], undefined> }

    function checkField<T, K extends keyof T>(o: T | MakeRequired<T, K>, field: K): o is MakeRequired<T, K> {
        return !!o[field]
    }
    Object.keys(typeof model).map(key => {
        console.log("Data", data)
        console.log("Key", key)
        console.log("Validity", checkField(data, key))
    });
}

export function ValidateNotNullFields(data: any, fields: string[]) {
    let nullFields: string[] = [];
    let hasError: boolean = false;
    for (let key of fields) {
        if (data[key] == undefined) {
            nullFields.push(key);
            hasError = true;
        }
    }
    if (hasError) throw new Error(`Missing required fields, [${nullFields.join()}]`)
}