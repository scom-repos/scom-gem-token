import { Styles } from '@ijstech/components';
const Theme = Styles.Theme.ThemeVars;

export default Styles.style({
  $nest: {
    '::-webkit-scrollbar-track': {
      borderRadius: '12px',
      border: '1px solid transparent',
      backgroundColor: 'unset'
    },
    '::-webkit-scrollbar': {
      width: '8px',
      backgroundColor: 'unset'
    },
    '::-webkit-scrollbar-thumb': {
      borderRadius: '12px',
      background: 'rgba(0, 0, 0, 0.5) 0% 0% no-repeat padding-box'
    },
    '.btn-network': {
      boxShadow: 'none'
    },
    '.os-modal': {
      boxSizing: 'border-box',
      $nest: {
        '.i-modal_header': {
          borderRadius: '10px 10px 0 0',
          background: 'unset',
          borderBottom: `2px solid ${Theme.divider}`,
          padding: '1rem 0',
          fontWeight: 700,
          fontSize: '1rem'
        },
        '.modal': {
          padding: 0
        },
        '.list-view': {
          $nest: {
            '.list-item': {
              cursor: 'pointer',
              transition: 'all .3s ease-in',
              $nest: {
                '&.disabled': {
                  cursor: 'default',
                  $nest: {
                    '&:hover > *': {
                      opacity: '0.5 !important',
                    }
                  }
                }
              }
            },
            '&.is-combobox': {
              $nest: {
                '.is-active': {
                  background: Theme.action.active,
                  fontWeight: 600
                },
                '.list-item:not(.is-active):hover': {
                  background: Theme.action.hover
                }
              }
            }
          }
        },
        '&> div': {
          transform: 'scale(1)'
        }
      }
    },
    '.box-shadow > div': {
      boxShadow: '0 3px 6px -4px rgba(0,0,0,.12), 0 6px 16px 0 rgba(0,0,0,.08), 0 9px 28px 8px rgba(0,0,0,.05)'
    },
    '.is-ellipsis': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    '.btn-cb-network': {
      justifyContent: "space-between"
    },
    '.btn-cb-network:hover': {
      border: `1px solid ${Theme.colors.primary.main}`
    },
    '.btn-focus': {
      border: `1px solid ${Theme.colors.primary.main}`,
      boxShadow: '0 0 0 2px rgba(87, 75, 144, .2)'
    },
    '.full-width': {
      width: '100%'
    }
  }
})
