import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegister } from 'react-hook-form';
import { z } from 'zod';
import type { Intake } from '../types';

const schema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Name is required'),
    company: z.string().optional(),
    phone: z.string().min(3, 'Phone is required'),
    email: z.string().email('Email must be valid').min(1, 'Email is required'),
    address: z.string().min(1, 'Address is required'),
  }),
  description: z
    .string()
    .min(20, 'Please add 1–5 sentences')
    .max(600, 'Keep it brief'),
  site: z.object({
    difficultAccess: z.boolean(),
  }),
});

type IntakeFormValues = z.infer<typeof schema>;

type Props = {
  initialValue: Intake;
  onSubmit: (data: Intake) => void;
  disabled?: boolean;
};

const InputField = ({
  label,
  id,
  register,
  error,
  required,
  type = 'text',
  disabled,
}: {
  label: string;
  id: string;
  register: ReturnType<UseFormRegister<IntakeFormValues>>;
  error?: string;
  required?: boolean;
  type?: string;
  disabled?: boolean;
}) => (
  <div className='flex flex-col gap-1'>
    <label htmlFor={id} className='text-sm font-medium text-slate-200'>
      {label}
      {required ? <span className='text-rose-400'>*</span> : null}
    </label>
    <input
      id={id}
      type={type}
      className='w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-inner placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
      {...register}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      disabled={disabled}
    />
    {error ? (
      <p id={`${id}-error`} className='text-xs text-rose-300'>
        {error}
      </p>
    ) : null}
  </div>
);

const IntakeForm = ({ initialValue, onSubmit, disabled }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IntakeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValue,
  });

  return (
    <form
      className='flex flex-col gap-4'
      onSubmit={handleSubmit((data) => onSubmit(data))}
    >
      <InputField
        label='Customer Name'
        id='customer.name'
        register={register('customer.name')}
        error={errors.customer?.name?.message}
        required
        type='text'
        disabled={disabled || isSubmitting}
      />
      <InputField
        label='Company'
        id='customer.company'
        register={register('customer.company')}
        error={errors.customer?.company?.message}
        disabled={disabled || isSubmitting}
      />
      <InputField
        label='Phone'
        id='customer.phone'
        register={register('customer.phone')}
        error={errors.customer?.phone?.message}
        required
        disabled={disabled || isSubmitting}
      />
      <InputField
        label='Email'
        id='customer.email'
        register={register('customer.email')}
        error={errors.customer?.email?.message}
        required
        type='email'
        disabled={disabled || isSubmitting}
      />
      <InputField
        label='Address'
        id='customer.address'
        register={register('customer.address')}
        error={errors.customer?.address?.message}
        required
        disabled={disabled || isSubmitting}
      />

      <div className='flex flex-col gap-1'>
        <label
          htmlFor='description'
          className='text-sm font-medium text-slate-200'
        >
          Description <span className='text-rose-400'>*</span>
        </label>
        <textarea
          id='description'
          rows={4}
          className='w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-inner placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand'
          placeholder='1–5 sentences...'
          {...register('description')}
          disabled={disabled || isSubmitting}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? 'description-error' : undefined
          }
        />
        {errors.description ? (
          <p id='description-error' className='text-xs text-rose-300'>
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <label className='flex items-center gap-2 text-sm font-medium text-slate-200'>
        <input
          type='checkbox'
          className='h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand focus:ring-brand'
          {...register('site.difficultAccess')}
          disabled={disabled || isSubmitting}
        />
        Difficult Access
      </label>

      <div className='flex gap-2'>
        <button
          type='submit'
          disabled={isSubmitting || disabled}
          className='inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60'
        >
          {isSubmitting || disabled ? (
            <span className='flex items-center gap-2'>
              <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white' />
              Running...
            </span>
          ) : (
            'Run Matching'
          )}
        </button>
      </div>
    </form>
  );
};

export default IntakeForm;
