import { ValidationError } from "src/utils/exceptions";

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

export function validateNotNullFields(data: any, fields: string[]) {
    let nullFields: string[] = [];
    let hasError: boolean = false;
    for (let key of fields) {
        if (data[key] == undefined) {
            nullFields.push(key);
            hasError = true;
        }
    }
    if (hasError) throw new ValidationError(`Missing required fields, [${nullFields.join()}]`)
}

export function validateUnnecessaryFields(data: any, fields: string[]) {
    let unknownFields: string[] = [];
    let hasError: boolean = false;
    Object.keys(data).forEach(key => {
        if (!fields.includes(key)) {
            unknownFields.push(key);
            hasError = true;
        }
    });
    if (hasError) throw new ValidationError(`Contains invalid fields, [${unknownFields.join()}]`)
}

export function validationWithEnum<T>(type: T, data: any, field: string) {
    const keys = Object.keys(type);
    if (!data[field] && !keys.includes(data[field])) throw new ValidationError(`Invalid value for, [${field}]`)
}
