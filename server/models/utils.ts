import { Literal } from 'sequelize/types/lib/utils'
import { Order } from 'sequelize'

// Translate for example "-name" to [ [ 'name', 'DESC' ], [ 'id', 'ASC' ] ]
function getSort (value: string, lastSort: string[] = [ 'id', 'ASC' ], mappingColumns?: { [ id: string ]: Literal | string }) {
  let field: Literal | string
  let direction: 'ASC' | 'DESC'

  if (value.substring(0, 1) === '-') {
    direction = 'DESC'
    field = value.substring(1)
  } else {
    direction = 'ASC'
    field = value
  }

  if (mappingColumns && mappingColumns[field]) field = mappingColumns[field]

  return [ [ field, direction ], lastSort ] as any // FIXME: typings
}

function throwIfNotValid (value: any, validator: (value: any) => boolean, fieldName = 'value') {
  if (validator(value) === false) {
    throw new Error(`"${value}" is not a valid ${fieldName}.`)
  }
}

// ---------------------------------------------------------------------------

export {
  getSort,
  throwIfNotValid
}
