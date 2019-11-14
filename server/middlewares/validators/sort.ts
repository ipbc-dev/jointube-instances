import { SORTABLE_COLUMNS } from '../../initializers/constants'
import { checkSort, createSortableColumns } from './utils'

const SORTABLE_INSTANCES_COLUMNS = createSortableColumns(SORTABLE_COLUMNS.INSTANCES)
const SORTABLE_INSTANCE_HOSTS_COLUMNS = createSortableColumns(SORTABLE_COLUMNS.INSTANCE_HOSTS)

const instancesSortValidator = checkSort(SORTABLE_INSTANCES_COLUMNS)
const instanceHostsSortValidator = checkSort(SORTABLE_INSTANCE_HOSTS_COLUMNS)

// ---------------------------------------------------------------------------

export {
  instancesSortValidator,
  instanceHostsSortValidator
}
