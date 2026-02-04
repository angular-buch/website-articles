import { mkdirp } from 'fs-extra';

import { MaterialEntry } from './material.types';
import { copyEntriesToDist, getEntryList } from './base.utils';
import { MARKDOWN_BASE_URL, DIST_FOLDER, MATERIAL_FOLDER } from '../config';

async function build(): Promise<void> {
  // NOTE: Does NOT clear dist folder - assumes build-init ran first!
  await mkdirp(DIST_FOLDER + '/material');

  const materialList = await getEntryList<MaterialEntry>(MATERIAL_FOLDER, MARKDOWN_BASE_URL + 'material/');
  await copyEntriesToDist(materialList, MATERIAL_FOLDER, DIST_FOLDER + '/material');
}

build().catch((error) => {
  console.error('Build material failed:', error);
  process.exit(1);
});
