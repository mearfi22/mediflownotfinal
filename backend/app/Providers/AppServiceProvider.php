<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Patient;
use App\Models\MedicalRecord;
use App\Models\Queue;
use App\Models\QueueTransfer;
use App\Models\User;
use App\Models\PreRegistration;
use App\Models\Department;
use App\Observers\PatientObserver;
use App\Observers\MedicalRecordObserver;
use App\Observers\QueueObserver;
use App\Observers\QueueTransferObserver;
use App\Observers\UserObserver;
use App\Observers\PreRegistrationObserver;
use App\Observers\DepartmentObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for audit logging
        Patient::observe(PatientObserver::class);
        MedicalRecord::observe(MedicalRecordObserver::class);
        Queue::observe(QueueObserver::class);
        QueueTransfer::observe(QueueTransferObserver::class);
        User::observe(UserObserver::class);
        PreRegistration::observe(PreRegistrationObserver::class);
        Department::observe(DepartmentObserver::class);
    }
}
