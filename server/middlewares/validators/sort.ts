import { SORTABLE_COLUMNS } from '../../initializers/constants'
import { checkSort, createSortableColumns } from '@peertube/server/middlewares/validators/utils'

const SORTABLE_INSTANCES_COLUMNS = createSortableColumns(SORTABLE_COLUMNS.INSTANCES)

const instancesSortValidator = checkSort(SORTABLE_INSTANCES_COLUMNS)

// ---------------------------------------------------------------------------

export {
  instancesSortValidator
}
