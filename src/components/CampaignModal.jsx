import { useMemo } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { post, put } from '@/utils/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export function CampaignModal({ campaign, isOpen, onClose, onSave, countries }) {
  const isEdit = useMemo(() => !!(campaign && campaign._id), [campaign]);

  if (!isOpen) return null;

  const initialValues = isEdit
    ? {
        originalUrl: campaign?.originalUrl || '',
        country: campaign?.country || '',
        urlSuffix: (campaign?.urlSuffix || '')
          .split(',')
          .map(k => k.trim())
          .filter(Boolean)
      }
    : { originalUrl: '', country: '', urlSuffix: [''] };

  const validationSchema = Yup.object().shape({
    originalUrl: Yup.string().url('Enter a valid URL').required('Original URL is required'),
    country: Yup.string().required('Country is required'),
    urlSuffix: Yup.array()
      .of(Yup.string().trim().min(1, 'Key cannot be empty'))
      .min(1, 'At least one URL suffix key is required')
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{isEdit ? 'Edit Campaign' : 'Create Campaign'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
            setSubmitting(true);
            try {
              const filteredUrlSuffix = values.urlSuffix.map(k => k.trim()).filter(Boolean);
              const payload = {
                originalUrl: values.originalUrl,
                country: values.country,
                urlSuffix: filteredUrlSuffix
              };
              const data = isEdit
                ? await put(`/campaign/${campaign._id}`, payload)
                : await post('/campaign', payload);
              toast({ title: isEdit ? 'Campaign updated successfully!' : 'Campaign created!' });
              onSave?.(data);
              if (!isEdit) resetForm();
              onClose();
            } catch (err) {
              // Surface backend field errors if present
              if (err && err.data && err.data.errors) {
                setErrors(err.data.errors);
              }
              toast({ title: err.message || 'Request failed', variant: 'destructive' });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form className="space-y-4">
              <div>
                <Label htmlFor="originalUrl">Original URL</Label>
                <Field as={Input} id="originalUrl" name="originalUrl" type="url" placeholder="https://example.com" />
                <ErrorMessage name="originalUrl" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select value={values.country} onValueChange={(val) => setFieldValue('country', val)}>
                  <SelectTrigger id="country" className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ErrorMessage name="country" component="div" className="text-red-600 text-xs mt-1" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">URL Suffix Keys</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFieldValue('urlSuffix', [...values.urlSuffix, ''])}
                    className="text-xs h-7 px-2"
                  >
                    Add More
                  </Button>
                </div>

                {values.urlSuffix.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 border border-dashed border-gray-200 rounded-md text-sm">
                    <p>No URL suffix keys</p>
                    <ErrorMessage name="urlSuffix" component="div" className="text-red-600 text-xs mt-1" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {values.urlSuffix.map((key, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <Field
                            as={Input}
                            name={`urlSuffix[${index}]`}
                            placeholder="Key (e.g., irclickid)"
                            className="text-sm h-8"
                          />
                          <ErrorMessage name={`urlSuffix[${index}]`} component="div" className="text-red-600 text-xs mt-1" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setFieldValue('urlSuffix', values.urlSuffix.filter((_, i) => i !== index))}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <ErrorMessage name="urlSuffix" component="div" className="text-red-600 text-xs mt-1" />

                {values.urlSuffix.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-800 font-medium mb-1">Preview:</p>
                    <p className="text-xs text-blue-700 font-mono break-all">
                      {values.urlSuffix
                        .map(k => k.trim())
                        .filter(Boolean)
                        .map(k => `${k}={random}`)
                        .join('&') || 'No valid keys yet'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isEdit ? (isSubmitting ? 'Updating...' : 'Update Campaign') : (isSubmitting ? 'Creating...' : 'Create Campaign')}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}


