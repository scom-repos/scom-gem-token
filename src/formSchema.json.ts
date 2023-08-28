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
    },
    uiSchema: {
        type: 'Categorization',
        elements: [
            {
                type: 'Category',
                label: 'Theme',
                elements: [
                    {
                        type: 'VerticalLayout',
                        elements: [
                            {
                                type: 'Control',
                                label: 'Dark',
                                scope: '#/properties/dark'
                            },
                            {
                                type: 'Control',
                                label: 'Light',
                                scope: '#/properties/light'
                            }
                        ]
                    }
                ]
            }
        ]
    }
}