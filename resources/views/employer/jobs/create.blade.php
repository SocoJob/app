@extends('employer.layouts.app')
@section('title')
{{ __('messages.job.new_job') }}
@endsection
@push('css')
{{-- <link href="{{ asset('assets/css/summernote.min.css') }}" rel="stylesheet" type="text/css"/>--}}
<link href="{{ asset('assets/css/select2.min.css') }}" rel="stylesheet" type="text/css" />
<link href="{{ asset('css/bootstrap-datetimepicker.css') }}" rel="stylesheet" type="text/css" />
@endpush
@section('content')
<div class="d-flex flex-column">
    @include('layouts.errors')

    <div class="card">
        <div class="card-body">
            {{ Form::open(['route' => 'job.store','id' => 'createJobForm']) }}
            @include('employer.jobs.fields')
            {{ Form::close() }}
        </div>
    </div>
</div>
{{Form::hidden('employeeJobForm',true,['id'=>'employeeJobForm'])}}
{{Form::hidden('employerPanel',true,['class'=>'jobEmployeePanel'])}}
{{Form::hidden('isEdit',true,['class'=>'isEdit'])}}
@endsection
@push('scripts')
<script>
    setTimeout(showAlert, 1000);




    function showAlert() {
        let states = document.getElementById("stateId");
        if (states) {
            let divStates = document.getElementById("div_states");
            let count = states.options.length;
            if (count > 1) {
                divStates.classList.remove("d-none")
            } else {
                divStates.classList.add("d-none")
            }
        }
        let cities = document.getElementById("cityId");

        if (cities) {
            let divCities = document.getElementById("div_cities");
            count = cities.options.length;

            if (count > 1) {
                divCities.classList.remove("d-none")
            } else {
                divCities.classList.add("d-none")
            }
        }
        if(states && cities){
            setTimeout(showAlert, 1000);
        }
  
    }
</script>

@endpush