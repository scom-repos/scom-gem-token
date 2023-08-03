const theme = {
    backgroundColor: {
        type: 'string',
        format: 'color'
    },
    fontColor: {
        type: 'string',
        format: 'color'
    },
    inputBackgroundColor: {
        type: 'string',
        format: 'color'
    },
    inputFontColor: {
        type: 'string',
        format: 'color'
    }
}

export default {
    general: {
        dataSchema: {
            type: 'object',
            properties: {}
        }
    },
    theme: {
        dataSchema: {
            type: 'object',
            properties: {
                dark: {
                    type: 'object',
                    properties: theme
                },
                light: {
                    type: 'object',
                    properties: theme
                }
            }
        }
    }
}