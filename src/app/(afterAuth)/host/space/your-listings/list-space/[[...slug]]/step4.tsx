'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Typography from '@/components/ui/typoGraphy';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUpdateSpaceListStep4, SpaceDetailsInterface } from '@/services';
import { PATHS } from '@/constants/path';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema, Step4FormValues } from './schemas';

interface Step4Props {
    editData?: SpaceDetailsInterface;
    isEdit?: string;
}

const makeSession = () => ({
    fromHours: '',
    fromMinutes: '00',
    fromPeriod: 'AM',
    toHours: '',
    toMinutes: '00',
    toPeriod: 'PM',
});

const initialOperationHours: Record<string, any> = {
    Monday: { isOpen: true, sessions: [makeSession()] },
    Tuesday: { isOpen: true, sessions: [makeSession()] },
    Wednesday: { isOpen: true, sessions: [makeSession()] },
    Thursday: { isOpen: true, sessions: [makeSession()] },
    Friday: { isOpen: true, sessions: [makeSession()] },
    Saturday: { isOpen: true, sessions: [makeSession()] },
    Sunday: { isOpen: true, sessions: [makeSession()] },
};

const mapOperatingHoursForAPI = (spaceId: number, hours: any, isEditFlag: boolean) => {
    const result: any = {};
    Object.keys(hours).forEach((day) => {
        const d = hours[day];
        if (!d.isOpen) {
            result[day] = { is_open: false };
        } else {
            result[day] = {
                is_open: true,
                sessions: d.sessions.map((s: any) => ({
                    from: `${s.fromHours.padStart(2, '0')}:${s.fromMinutes.padStart(2, '0')} ${s.fromPeriod}`,
                    to: `${s.toHours.padStart(2, '0')}:${s.toMinutes.padStart(2, '0')} ${s.toPeriod}`,
                })),
            };
        }
    });

    return { space_id: spaceId, operating_hours: result, is_edit: isEditFlag };
};

const getInputClassName = (hasError?: boolean) =>
    `w-16 h-10 text-center text-sm font-medium border rounded-md focus:ring-2 focus:ring-[#F6CD28] focus:border-[#F6CD28] transition-colors duration-200 border-gray-300 ${hasError ? 'border-red-500' : ''}`;

interface TimeSelectorProps {
    day: keyof Step4FormValues;
    sessionIndex: number;
    timeType: 'from' | 'to';
    label: string;
    session: any;
    updateTime: (
        day: keyof Step4FormValues,
        sessionIndex: number,
        field: string,
        value: string,
    ) => void;
    handlePeriodChange: (
        day: keyof Step4FormValues,
        sessionIndex: number,
        timeType: 'from' | 'to',
        period: string,
    ) => void;
    errors: any;
}

const TimeSelector = ({
    day,
    sessionIndex,
    timeType,
    label,
    session,
    updateTime,
    handlePeriodChange,
    errors,
}: TimeSelectorProps) => {
    const [localHours, setLocalHours] = useState(session[`${timeType}Hours`]);
    const [localMinutes, setLocalMinutes] = useState(session[`${timeType}Minutes`]);

    // Sync local state if external change (e.g. reset/load)
    useEffect(() => {
        setLocalHours(session[`${timeType}Hours`]);
        setLocalMinutes(session[`${timeType}Minutes`]);
    }, [session[`${timeType}Hours`], session[`${timeType}Minutes`]]);

    const handleBlur = () => {
        let h = parseInt(localHours) || 1;
        if (h > 12) h = 12;
        let m = parseInt(localMinutes) || 0;
        if (m > 59) m = 59;

        const hStr = String(h).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');

        setLocalHours(hStr);
        setLocalMinutes(mStr);
        updateTime(day, sessionIndex, `${timeType}Hours`, hStr);
        updateTime(day, sessionIndex, `${timeType}Minutes`, mStr);
    };

    // Error handling
    const fieldError =
        errors[day]?.sessions?.[sessionIndex]?.[`${timeType}Hours`] ||
        errors[day]?.sessions?.[sessionIndex]?.[`${timeType}Minutes`];

    return (
        <div className="space-y-2 pb-2">
            <Label className="text-sm font-medium text-gray-700">{label}</Label>
            <div className="flex items-center gap-1.5">
                <Input
                    containerClassName="w-fit sm:w-full"
                    className={getInputClassName(!!fieldError)}
                    value={localHours}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                        setLocalHours(val);
                        updateTime(day, sessionIndex, `${timeType}Hours`, val);
                    }}
                    onBlur={handleBlur}
                    placeholder="01"
                    inputMode="numeric"
                />
                <span className="font-bold text-gray-600">:</span>
                <Input
                    containerClassName="w-fit sm:w-full"
                    className={getInputClassName(!!fieldError)}
                    value={localMinutes}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
                        setLocalMinutes(val);
                        updateTime(day, sessionIndex, `${timeType}Minutes`, val);
                    }}
                    onBlur={handleBlur}
                    placeholder="00"
                    inputMode="numeric"
                />
                <div className="flex ml-1">
                    <Button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handlePeriodChange(day, sessionIndex, timeType, 'AM');
                        }}
                        className={`px-3 rounded-none rounded-l-md font-semibold text-sm ${session[`${timeType}Period`] === 'AM' ? 'bg-[#F6CD28] text-black' : 'border bg-white'}`}
                    >
                        AM
                    </Button>
                    <Button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handlePeriodChange(day, sessionIndex, timeType, 'PM');
                        }}
                        className={`px-3 rounded-none rounded-r-md font-semibold text-sm ${session[`${timeType}Period`] === 'PM' ? 'bg-[#F6CD28] text-black' : 'border bg-white'}`}
                    >
                        PM
                    </Button>
                </div>
            </div>
            {fieldError && <div className="text-red-500 text-xs mt-2">{fieldError.message}</div>}
        </div>
    );
};

interface DayRowProps {
    day: keyof Step4FormValues;
    dayData: any;
    toggleDay: (day: keyof Step4FormValues) => void;
    addSession: (day: keyof Step4FormValues) => void;
    removeSession: (day: keyof Step4FormValues, index: number) => void;
    updateTime: (
        day: keyof Step4FormValues,
        sessionIndex: number,
        field: string,
        value: string,
    ) => void;
    handlePeriodChange: (
        day: keyof Step4FormValues,
        sessionIndex: number,
        timeType: 'from' | 'to',
        period: string,
    ) => void;
    applyToAllDays: (day: keyof Step4FormValues) => void;
    disabled?: boolean;
    errors: any;
}

const DayRow = ({
    day,
    dayData,
    toggleDay,
    addSession,
    removeSession,
    updateTime,
    handlePeriodChange,
    applyToAllDays,
    disabled,
    errors,
}: DayRowProps) => {
    const isCurrentlyOpen = disabled ? false : dayData.isOpen;

    return (
        <div className={`flex flex-col border-b border-gray-100 py-4 ${disabled ? 'cursor-not-allowed select-none opacity-60' : ''}`}>
            <div className="flex w-full sm:w-56 justify-between items-center gap-4 min-w-[120px]">
                <Label className={`text-base font-semibold ${disabled ? 'text-gray-400' : 'text-zinc-800'}`}>{day}</Label>
                <div className="flex w-28 justify-between items-center gap-2">
                    <Toggle
                        type="button"
                        pressed={isCurrentlyOpen}
                        onPressedChange={() => !disabled && toggleDay(day)}
                        disabled={disabled}
                        className={`relative w-12 h-6 rounded-full p-0 transition-colors duration-300 ease-in-out 
                    data-[state=on]:bg-[#F6CD28] 
                    data-[state=off]:bg-gray-300 
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:data-[state=on]:bg-amber-500 hover:data-[state=off]:bg-gray-400'}`}
                    >
                        <div
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
                        transition-all duration-300 ease-in-out
                        ${isCurrentlyOpen ? 'translate-x-6' : 'translate-x-0'}`}
                        />
                    </Toggle>
                    <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isCurrentlyOpen ? 'Open' : 'Closed'}
                    </span>
                </div>
            </div>

            {isCurrentlyOpen && (
                <div className="flex flex-col gap-4 mt-4">
                    {dayData.sessions.map((session: any, idx: number) => (
                        <div key={idx} className="flex flex-col md:flex-row md:items-start gap-6">
                            <TimeSelector
                                day={day}
                                sessionIndex={idx}
                                timeType="from"
                                label="From"
                                session={session}
                                updateTime={updateTime}
                                handlePeriodChange={handlePeriodChange}
                                errors={errors}
                            />
                            <TimeSelector
                                day={day}
                                sessionIndex={idx}
                                timeType="to"
                                label="To"
                                session={session}
                                updateTime={updateTime}
                                handlePeriodChange={handlePeriodChange}
                                errors={errors}
                            />
                            {dayData.sessions.length > 1 && (
                                <div className="md:mt-7">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        className="h-10 px-6 rounded-full"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            removeSession(day, idx);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addSession(day);
                            }}
                        >
                            + Add Slot
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                applyToAllDays(day);
                            }}
                            className="border-[#F6CD28] hover:bg-[#F6CD28]/10 text-gray-800"
                        >
                            Apply to all days
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

const Step4 = ({ editData, isEdit }: Step4Props) => {
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');
    const queryClient = useQueryClient();
    const router = useRouter();
    const scrollPositionRef = useRef<number>(0);

    const [isLoading, setIsLoading] = useState(isEdit === 'true');
    const isInitializedRef = useRef(false);

    const {
        watch,
        setValue,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Step4FormValues>({
        resolver: zodResolver(step4Schema),
        defaultValues: initialOperationHours,
    });

    const operatingHours = watch();

    const getDefaultHours = () => {
        if (isEdit === 'true' && editData?.SpaceListing?.operating_hours) {
            const updatedHours: any = JSON.parse(JSON.stringify(initialOperationHours));
            const editHours = editData.SpaceListing.operating_hours;

            Object.keys(editHours).forEach((day) => {
                if (!updatedHours[day]) return;
                const dayData = editHours[day];
                updatedHours[day].isOpen = dayData.is_open;

                if (dayData.is_open && dayData.sessions?.length) {
                    updatedHours[day].sessions = dayData.sessions.map((s: any) => {
                        const fromMatch = s.from.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        const toMatch = s.to.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                        return {
                            fromHours: fromMatch ? fromMatch[1].padStart(2, '0') : '',
                            fromMinutes: fromMatch ? fromMatch[2] : '',
                            fromPeriod: fromMatch ? fromMatch[3].toUpperCase() : 'AM',
                            toHours: toMatch ? toMatch[1].padStart(2, '0') : '',
                            toMinutes: toMatch ? toMatch[2] : '',
                            toPeriod: toMatch ? toMatch[3].toUpperCase() : 'PM',
                        };
                    });
                }
            });
            return updatedHours;
        }
        return initialOperationHours;
    };

    const is24_7Session = (sessions: any[]) => {
        if (sessions?.length !== 2) return false;
        const s1 = sessions[0];
        const s2 = sessions[1];
        const hasS1 = s1.fromHours === '12' && s1.fromMinutes === '00' && s1.fromPeriod === 'AM' &&
                      s1.toHours === '12' && s1.toMinutes === '00' && s1.toPeriod === 'PM';
        const hasS2 = s2.fromHours === '12' && s2.fromMinutes === '00' && s2.fromPeriod === 'PM' &&
                      s2.toHours === '12' && s2.toMinutes === '00' && s2.toPeriod === 'AM';
        
        return (hasS1 && hasS2) || (
            s1.fromHours === '12' && s1.fromMinutes === '00' && s1.fromPeriod === 'PM' &&
            s1.toHours === '12' && s1.toMinutes === '00' && s1.toPeriod === 'AM' &&
            s2.fromHours === '12' && s2.fromMinutes === '00' && s2.fromPeriod === 'AM' &&
            s2.toHours === '12' && s2.toMinutes === '00' && s2.toPeriod === 'PM'
        );
    };

    const isAllDays24_7_of = (hours: any) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days.every((day) => hours[day]?.isOpen && is24_7Session(hours[day]?.sessions));
    };

    const isAllDays24_7 = () => {
        return isAllDays24_7_of(operatingHours);
    };

    const isOpen247 = isAllDays24_7();

    const handleOpen247Toggle = (checked: boolean) => {
        saveScroll();
        if (checked) {
            const open247Data: any = {};
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            days.forEach((day) => {
                open247Data[day] = {
                    isOpen: true,
                    sessions: [
                        {
                            fromHours: '12',
                            fromMinutes: '00',
                            fromPeriod: 'AM',
                            toHours: '12',
                            toMinutes: '00',
                            toPeriod: 'PM',
                        },
                        {
                            fromHours: '12',
                            fromMinutes: '00',
                            fromPeriod: 'PM',
                            toHours: '12',
                            toMinutes: '00',
                            toPeriod: 'AM',
                        },
                    ],
                };
            });
            reset(open247Data);
        } else {
            reset({
                Monday: { isOpen: true, sessions: [makeSession()] },
                Tuesday: { isOpen: false, sessions: [makeSession()] },
                Wednesday: { isOpen: false, sessions: [makeSession()] },
                Thursday: { isOpen: false, sessions: [makeSession()] },
                Friday: { isOpen: false, sessions: [makeSession()] },
                Saturday: { isOpen: false, sessions: [makeSession()] },
                Sunday: { isOpen: false, sessions: [makeSession()] },
            });
        }
    };

    const { mutate: submitStep4, isPending } = useUpdateSpaceListStep4({
        onSuccess: (response) => {
            toast.success(response.message);
            queryClient.invalidateQueries({ queryKey: ['spaceDetails', Number(spaceId)] });
            const editParam = isEdit === 'true' ? '&isEdit=true' : '';
            router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=5${editParam}`);
        },
        onError: (error) => {
            toast.error(error.message || 'Something went wrong');
        },
    });

    useEffect(() => {
        if (isEdit === 'true' && !isInitializedRef.current && editData) {
            reset(getDefaultHours());
            setIsLoading(false);
            isInitializedRef.current = true;
        }
    }, [editData, isEdit, reset]);

    // UI Helpers using setValue
    const toggleDay = (day: keyof Step4FormValues) => {
        saveScroll();
        setValue(`${day}.isOpen` as any, !operatingHours[day].isOpen, {
            shouldValidate: true,
        });
    };

    const updateTime = (
        day: keyof Step4FormValues,
        sessionIndex: number,
        field: string,
        value: string,
    ) => {
        saveScroll();
        setValue(`${day}.sessions.${sessionIndex}.${field}` as any, value, {
            shouldValidate: true,
        });
    };

    const addSession = (day: keyof Step4FormValues) => {
        saveScroll();
        const currentSessions = operatingHours[day].sessions;
        setValue(`${day}.sessions` as any, [...currentSessions, makeSession()]);
    };

    const removeSession = (day: keyof Step4FormValues, index: number) => {
        saveScroll();
        const currentSessions = operatingHours[day].sessions;
        setValue(
            `${day}.sessions` as any,
            currentSessions.filter((_, i) => i !== index),
        );
    };

    const applyToAllDays = (sourceDay: keyof Step4FormValues) => {
        saveScroll();
        const sourceData = operatingHours[sourceDay];
        const days = Object.keys(operatingHours) as (keyof Step4FormValues)[];
        days.forEach((day) => {
            if (day !== sourceDay) {
                setValue(day, JSON.parse(JSON.stringify(sourceData)), {
                    shouldValidate: true,
                });
            }
        });
    };

    const handlePeriodChange = (
        day: keyof Step4FormValues,
        sessionIndex: number,
        timeType: 'from' | 'to',
        period: string,
    ) => {
        updateTime(day, sessionIndex, `${timeType}Period`, period);
    };

    const saveScroll = () => {
        scrollPositionRef.current = window.scrollY || document.documentElement.scrollTop;
    };

    // Restore scroll
    useEffect(() => {
        if (scrollPositionRef.current > 0) {
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: scrollPositionRef.current,
                    behavior: 'instant',
                });
            });
        }
    }, [operatingHours]);

    const onSubmit = (data: Step4FormValues) => {
        const payload = mapOperatingHoursForAPI(Number(spaceId), data, isEdit === 'true');
        submitStep4(payload);
    };

    const handleGoBack = () => {
        router.push(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=3&isEdit=true`);
    };

    if (isLoading) {
        return (
            <div className="space-y-8 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-20 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F6CD28]"></div>
                    <Typography weight="medium" color="text-gray-600" size="lg">
                        Loading operating hours...
                    </Typography>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 md:p-8 p-4 rounded-2xl outline outline-offset-[-1px] outline-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
                    <Typography weight="semibold" color="text-gray-900" size="2xl">
                        Operating Hours
                    </Typography>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="open-24-7"
                            checked={isOpen247}
                            onCheckedChange={(checked) => handleOpen247Toggle(!!checked)}
                        />
                        <Label htmlFor="open-24-7" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                            Open 24/7
                        </Label>
                    </div>
                </div>
                <div className="space-y-1">
                    {/* Render global error if any (e.g. at least one day open) */}
                    {(Object.keys(operatingHours) as (keyof Step4FormValues)[]).map((day) => (
                        <DayRow
                            key={day}
                            day={day}
                            dayData={operatingHours[day]}
                            toggleDay={toggleDay}
                            addSession={addSession}
                            removeSession={removeSession}
                            updateTime={updateTime}
                            handlePeriodChange={handlePeriodChange}
                            applyToAllDays={applyToAllDays}
                            disabled={isOpen247}
                            errors={errors}
                        />
                    ))}
                </div>
                {errors.root && (
                    <div className="text-red-500 text-sm mt-4">{errors.root.message}</div>
                )}
                {/* Zod refine on object itself might land in errors.root or empty path? 
                     Usually "At least one day..." refine on root object -> errors[''] or errors.root? 
                     Let's check root.
                 */}
                {/* Actually my schema refined the whole object. Error message "At least..." likely on root. 
                      Let's try to display errors global.
                  */}
            </div>

            <div className="w-full flex justify-end gap-4 items-end h-20">
                <Button type="button" disabled={isPending} variant="outline" onClick={handleGoBack}>
                    Go Back
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    variant={isPending ? 'disabled' : 'default'}
                >
                    {isPending ? 'Submitting...' : 'Continue'}
                </Button>
            </div>
        </form>
    );
};

export default Step4;
