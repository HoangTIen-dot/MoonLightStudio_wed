import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import { Building2, ImagePlus, Loader2, Pencil, Trash2, Upload, X } from 'lucide-react';
import { hasAdminToken } from '../../features/auth/auth.service';
import {
  createBrand,
  deleteBrand,
  getAdminBrands,
  type Brand,
  updateBrand,
} from '../../features/brands/brand.service';
import { uploadFileToCloudinary } from '../../features/videos/video.service';
import { AdminHeader } from '../../shared/components/AdminHeader';

type SaveState = 'idle' | 'saving' | 'complete' | 'failed';
const BRAND_NAME_LIMIT = 80;

export async function prepareBrandUploadFile(file: File) {
  return file;
}

export function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceFileName, setSourceFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasAdminToken()) {
      window.location.replace('/admin/login');
      return;
    }

    void loadData();
  }, []);

  const sortedBrands = useMemo(
    () => [...brands].sort((a, b) => a.displayOrder - b.displayOrder || b.createdAt.localeCompare(a.createdAt)),
    [brands],
  );

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const response = await getAdminBrands();
      setBrands(response.brands);
    } catch {
      setError('Could not load brand images. Check the backend server and MongoDB connection.');
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm(nextSaveState: SaveState = 'idle') {
    setBrandName('');
    setSelectedFile(null);
    setSourceFileName('');
    setPreviewUrl('');
    setEditingBrandId(null);
    setUploadProgress(0);
    setSaveState(nextSaveState);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(null);
    setSourceFileName(file?.name ?? '');
    setUploadProgress(0);
    setSaveState('idle');
    setError('');

    if (file) {
      const uploadFile = await prepareBrandUploadFile(file);
      setSelectedFile(uploadFile);
      setPreviewUrl(URL.createObjectURL(uploadFile));
    }
  }

  function handleEditBrand(brand: Brand) {
    setEditingBrandId(brand._id);
    setBrandName(brand.name);
    setSelectedFile(null);
    setSourceFileName('');
    setPreviewUrl(brand.logoUrl);
    setUploadProgress(0);
    setSaveState('idle');
    setError('');
  }

  async function handleDeleteBrand(brand: Brand) {
    const confirmed = window.confirm('Delete this brand image?');

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteBrand(brand._id);

      if (editingBrandId === brand._id) {
        resetForm();
      }

      await loadData();
    } catch {
      setError('Could not delete this brand image. Check the backend terminal.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!brandName.trim()) {
      setError('Brand name is required.');
      return;
    }

    if (!editingBrandId && !selectedFile) {
      setError('Choose an image before uploading.');
      return;
    }

    try {
      setSaveState('saving');
      setUploadProgress(0);

      const uploadResult = selectedFile ? await uploadFileToCloudinary(selectedFile, 'image', setUploadProgress) : null;
      const brandPayload = {
        name: brandName.trim(),
        websiteUrl: '',
        displayOrder: editingBrandId ? undefined : sortedBrands.length,
        isPublished: true,
      };

      if (editingBrandId) {
        await updateBrand(editingBrandId, {
          ...brandPayload,
          ...(uploadResult
            ? {
                logoUrl: uploadResult.secure_url,
                logoPublicId: uploadResult.public_id,
              }
            : {}),
        });
      } else {
        if (!uploadResult) {
          setError('Choose an image before uploading.');
          setSaveState('failed');
          return;
        }

        await createBrand({
          ...brandPayload,
          logoUrl: uploadResult.secure_url,
          logoPublicId: uploadResult.public_id,
        });
      }

      resetForm('complete');
      await loadData();
    } catch (caughtError) {
      setSaveState('failed');
      setError(caughtError instanceof Error ? caughtError.message : 'Could not upload this image.');
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F4F1] text-zinc-950">
      <AdminHeader backToDashboard />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
        <form className="rounded-lg border border-zinc-200 bg-white p-5" onSubmit={handleSubmit}>
          <div className="mb-6 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md bg-zinc-950 text-white">
              <Building2 size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {editingBrandId ? 'Update brand' : 'Create brand'}
              </h1>
              <p className="text-sm text-zinc-500">Name the brand and upload its logo tile.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Brand name</span>
              <input
                value={brandName}
                onChange={(event) => setBrandName(event.target.value)}
                maxLength={BRAND_NAME_LIMIT}
                required
                placeholder="Vinamilk"
                className="h-11 w-full rounded-md border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-500"
              />
              <span className="mt-1 block text-right text-xs text-zinc-400">
                {brandName.length}/{BRAND_NAME_LIMIT}
              </span>
            </label>

            <input id="brand-image-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <label
              htmlFor="brand-image-upload"
              className="grid cursor-pointer place-items-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center transition hover:border-zinc-500 hover:bg-white"
            >
              <ImagePlus size={34} className="mb-3 text-zinc-500" />
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-zinc-700">
                Choose image
              </span>
              <span className="mt-1 text-sm text-zinc-500">
                PNG, JPG, WebP files. The preview uses the same crop as the website.
              </span>
            </label>

            {previewUrl ? (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Preview</span>
                <div className="overflow-hidden rounded-md bg-zinc-950">
                  <img
                    src={previewUrl}
                    alt=""
                    className="aspect-[7/4] w-full object-cover"
                  />
                </div>
              </div>
            ) : null}

            {saveState === 'saving' ? (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                  <span>Uploading</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                  <div className="h-full bg-zinc-950 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : null}
          </div>

          {error ? <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {saveState === 'complete' ? (
            <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Brand image saved.</p>
          ) : null}

          <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={saveState === 'saving'}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-bold uppercase text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saveState === 'saving' ? <Loader2 className="animate-spin" size={17} /> : <Upload size={17} />}
              {saveState === 'saving' ? 'Saving brand' : editingBrandId ? 'Update brand' : 'Create brand'}
            </button>
            {editingBrandId ? (
              <button
                type="button"
                onClick={() => resetForm()}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-200 px-4 text-sm font-bold uppercase transition hover:bg-zinc-100"
              >
                <X size={17} />
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Brand images</h2>
              <p className="text-sm text-zinc-500">{sortedBrands.length} items</p>
            </div>
            <button
              type="button"
              onClick={() => void loadData()}
              className="h-10 rounded-md border border-zinc-200 px-3 text-sm font-semibold hover:bg-zinc-100"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-zinc-500">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sortedBrands.map((brand) => (
                <article key={brand._id} className="rounded-md border border-zinc-200 p-3">
                  <div className="overflow-hidden rounded-md bg-zinc-950">
                    <img
                      src={brand.logoUrl}
                      alt={brand.name}
                      className="aspect-[7/4] w-full object-cover"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-zinc-500">{brand.name}</span>
                    <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
                      Published
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditBrand(brand)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-semibold hover:bg-zinc-100"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteBrand(brand)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </article>
              ))}

              {!sortedBrands.length ? (
                <div className="rounded-md border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 sm:col-span-2 xl:col-span-3">
                  No brand images yet.
                </div>
              ) : null}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
