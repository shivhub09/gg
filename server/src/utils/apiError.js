class apiError extends Error{
    constructor(
        statuscode,
        message="Something went wrong",
        error=[],
        stack = ""
    ){
        super(message)
        this.statuscode = statuscode
        this.data = null
        this.message = message
        this.success = false
        this.erros = error

        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this.statuscode , this.constructor)
        }
    }
}

module.exports = apiError